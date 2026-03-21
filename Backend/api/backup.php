<?php
// Backend/api/backup.php

header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

// ═══════════════════════════════════════════════════════════════════════════════
// CLASSE : BackupService
// ═══════════════════════════════════════════════════════════════════════════════
class BackupService {

    private PDO    $pdo;
    private string $backupDir;

    public function __construct(PDO $pdo) {
        $this->pdo       = $pdo;
        $this->backupDir = __DIR__ . '/../../backups/';
        if (!is_dir($this->backupDir)) mkdir($this->backupDir, 0755, true);
    }

    // ── Créer un backup ───────────────────────────────────────────────────────
    public function create(): array {
        $timestamp = date('Y-m-d_H-i-s');
        $filename  = "backup_{$timestamp}.json";
        $filepath  = $this->backupDir . $filename;

        $tables = $this->pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);

        $data = ['timestamp' => $timestamp, 'database' => 'visioad_db', 'tables' => []];

        foreach ($tables as $table) {
            $create = $this->pdo->query("SHOW CREATE TABLE `{$table}`")->fetch();
            $rows   = $this->pdo->query("SELECT * FROM `{$table}`")->fetchAll();
            $data['tables'][$table] = [
                'structure' => $create['Create Table'] ?? '',
                'data'      => $rows,
                'count'     => count($rows),
            ];
        }

        file_put_contents($filepath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        $size = filesize($filepath);

        $stmt = $this->pdo->prepare("INSERT INTO backups (filename, size, tables_count, created_at) VALUES (:fn,:sz,:tc,NOW())");
        $stmt->execute([':fn' => $filename, ':sz' => $size, ':tc' => count($tables)]);

        return [
            'id'           => (int)$this->pdo->lastInsertId(),
            'filename'     => $filename,
            'size'         => $this->formatBytes($size),
            'tables'       => count($tables),
            'timestamp'    => $timestamp,
            'download_url' => "/backups/{$filename}",
        ];
    }

    // ── Lister les backups ────────────────────────────────────────────────────
    public function list(): array {
        $rows = $this->pdo->query("SELECT id, filename, size, tables_count, DATE_FORMAT(created_at,'%d/%m/%Y %H:%i') as date_display FROM backups ORDER BY created_at DESC")->fetchAll();
        foreach ($rows as &$r) $r['size_display'] = $this->formatBytes((int)$r['size']);
        return $rows;
    }

    // ── Supprimer un backup ───────────────────────────────────────────────────
    public function delete(int $id): bool {
        $stmt = $this->pdo->prepare("SELECT filename FROM backups WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();

        if (!$row) return false;

        $file = $this->backupDir . $row['filename'];
        if (file_exists($file)) unlink($file);

        $this->pdo->prepare("DELETE FROM backups WHERE id = :id")->execute([':id' => $id]);
        return true;
    }

    private function formatBytes(int $bytes): string {
        $units = ['B','KB','MB','GB'];
        $pow   = min(floor(($bytes ? log($bytes) : 0) / log(1024)), count($units) - 1);
        return round($bytes / pow(1024, $pow), 2) . ' ' . $units[$pow];
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLASSE : BackupController
// ═══════════════════════════════════════════════════════════════════════════════
class BackupController {

    private BackupService $service;

    public function __construct(PDO $pdo) {
        $this->service = new BackupService($pdo);
    }

    private function json(array $data, int $code = 200): void {
        http_response_code($code);
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit();
    }

    public function create(): void {
        $backup = $this->service->create();
        $this->json(['success' => true, 'message' => 'Sauvegarde créée avec succès', 'backup' => $backup]);
    }

    public function index(): void {
        $this->json(['success' => true, 'data' => $this->service->list(), 'count' => count($this->service->list())]);
    }

    public function destroy(int $id): void {
        $ok = $this->service->delete($id);
        $this->json(['success' => $ok, 'message' => $ok ? 'Backup supprimé' : 'Backup non trouvé'], $ok ? 200 : 404);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROUTEUR
// ═══════════════════════════════════════════════════════════════════════════════
try {
    AuthMiddleware::authorize('admin');

    $pdo        = (new Database())->getConnection();
    $controller = new BackupController($pdo);
    $method     = $_SERVER['REQUEST_METHOD'];
    $action     = $_GET['action'] ?? 'list';
    $id         = (int)($_GET['id'] ?? 0);

    match (true) {
        $method === 'POST'   && $action === 'create' => $controller->create(),
        $method === 'GET'    && $action === 'list'   => $controller->index(),
        $method === 'DELETE' && $id > 0              => $controller->destroy($id),
        default => (function() {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Action invalide']);
        })()
    };
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>