<?php
// Backend/api/media.php

header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: POST, GET, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

// ═══════════════════════════════════════════════════════════════════════════════
// CLASSE : MediaRepository
// ═══════════════════════════════════════════════════════════════════════════════
class MediaRepository {

    private PDO    $pdo;
    private string $uploadDir;

    public function __construct(PDO $pdo) {
        $this->pdo       = $pdo;
        $this->uploadDir = __DIR__ . '/../../Frontend/public/uploads/';
        if (!is_dir($this->uploadDir)) mkdir($this->uploadDir, 0755, true);
    }

    public function findAll(int $page, int $limit, string $search = '', string $type = ''): array {
        $offset = ($page - 1) * $limit;
        $where  = [];
        $params = [];

        if ($search) { $where[] = "(original_name LIKE :search OR filename LIKE :search)"; $params[':search'] = "%{$search}%"; }
        if ($type)   { $where[] = "mime_type LIKE :type"; $params[':type'] = "{$type}%"; }

        $w    = $where ? 'WHERE ' . implode(' AND ', $where) : '';
        $stmt = $this->pdo->prepare("SELECT *, DATE_FORMAT(created_at,'%d/%m/%Y %H:%i') as date_display FROM media {$w} ORDER BY created_at DESC LIMIT :lim OFFSET :off");
        $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':off', $offset, PDO::PARAM_INT);
        foreach ($params as $k => $v) $stmt->bindValue($k, $v);
        $stmt->execute();

        $rows  = $stmt->fetchAll();
        $total = (int)$this->pdo->prepare("SELECT COUNT(*) FROM media {$w}")->execute($params) ? $this->pdo->query("SELECT COUNT(*) FROM media {$w}")->fetchColumn() : 0;

        foreach ($rows as &$r) {
            $r['url']          = '/uploads/' . $r['path'];
            $r['size_display'] = $this->formatBytes((int)$r['size']);
        }

        return ['data' => $rows, 'total' => (int)$total, 'pages' => (int)ceil($total / $limit)];
    }

    public function save(array $file, string $uploadedBy): array {
        $allowed  = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        $maxSize  = 10 * 1024 * 1024;

        if (!in_array($file['type'], $allowed)) throw new Exception('Type de fichier non autorisé');
        if ($file['size'] > $maxSize)           throw new Exception('Fichier trop volumineux (max 10 Mo)');

        $ext      = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid() . '_' . time() . '.' . $ext;
        $dest     = $this->uploadDir . $filename;

        if (!move_uploaded_file($file['tmp_name'], $dest)) throw new Exception('Erreur lors du déplacement du fichier');

        $stmt = $this->pdo->prepare("INSERT INTO media (filename, original_name, mime_type, size, path, uploaded_by, created_at) VALUES (:fn,:on,:mt,:sz,:path,:by,NOW())");
        $stmt->execute([':fn' => $filename, ':on' => $file['name'], ':mt' => $file['type'], ':sz' => $file['size'], ':path' => $filename, ':by' => $uploadedBy]);

        return ['id' => (int)$this->pdo->lastInsertId(), 'filename' => $filename, 'url' => '/uploads/' . $filename, 'size' => $this->formatBytes($file['size']), 'type' => $file['type']];
    }

    public function delete(int $id): bool {
        $stmt = $this->pdo->prepare("SELECT path FROM media WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $media = $stmt->fetch();

        if (!$media) return false;

        $file = $this->uploadDir . $media['path'];
        if (file_exists($file)) unlink($file);

        $this->pdo->prepare("DELETE FROM media WHERE id = :id")->execute([':id' => $id]);
        return true;
    }

    private function formatBytes(int $bytes): string {
        $units = ['B','KB','MB','GB'];
        $pow   = min(floor(($bytes ? log($bytes) : 0) / log(1024)), count($units) - 1);
        return round($bytes / pow(1024, $pow), 2) . ' ' . $units[$pow];
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLASSE : MediaController
// ═══════════════════════════════════════════════════════════════════════════════
class MediaController {

    private MediaRepository $repo;

    public function __construct(PDO $pdo) {
        $this->repo = new MediaRepository($pdo);
    }

    private function json(array $data, int $code = 200): void {
        http_response_code($code);
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit();
    }

    public function index(): void {
        $page   = (int)($_GET['page']   ?? 1);
        $limit  = (int)($_GET['limit']  ?? 20);
        $search =       $_GET['search'] ?? '';
        $type   =       $_GET['type']   ?? '';

        $result = $this->repo->findAll($page, $limit, $search, $type);
        $this->json(array_merge(['success' => true, 'pagination' => ['page' => $page, 'limit' => $limit, 'total' => $result['total'], 'pages' => $result['pages']]], ['data' => $result['data']]));
    }

    public function upload(array $user): void {
        if (!isset($_FILES['file'])) $this->json(['success' => false, 'message' => 'Aucun fichier reçu'], 400);

        $media = $this->repo->save($_FILES['file'], $user['name'] ?? 'admin');
        $this->json(['success' => true, 'message' => 'Fichier uploadé avec succès', 'media' => $media]);
    }

    public function destroy(): void {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $id   = (int)($data['id'] ?? 0);

        if (!$id) $this->json(['success' => false, 'message' => 'ID requis'], 400);

        $ok = $this->repo->delete($id);
        $this->json(['success' => $ok, 'message' => $ok ? 'Média supprimé' : 'Média non trouvé'], $ok ? 200 : 404);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROUTEUR
// ═══════════════════════════════════════════════════════════════════════════════
try {
    $user = AuthMiddleware::authorize('admin');

    $pdo        = (new Database())->getConnection();
    $controller = new MediaController($pdo);
    $method     = $_SERVER['REQUEST_METHOD'];

    match ($method) {
        'GET'    => $controller->index(),
        'POST'   => $controller->upload($user),
        'DELETE' => $controller->destroy(),
        default  => (function() {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
        })()
    };
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>