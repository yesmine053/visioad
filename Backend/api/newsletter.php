<?php
// Backend/api/newsletter.php

header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: POST, GET, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../config/database.php';

// ═══════════════════════════════════════════════════════════════════════════════
// CLASSE : NewsletterRepository
// ═══════════════════════════════════════════════════════════════════════════════
class NewsletterRepository {

    private PDO    $pdo;
    private string $table = 'newsletter';

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function findAll(): array {
        return $this->pdo->query("SELECT id, email, subscribed_at FROM {$this->table} ORDER BY subscribed_at DESC")->fetchAll();
    }

    public function findByEmail(string $email): ?array {
        $stmt = $this->pdo->prepare("SELECT id FROM {$this->table} WHERE email = :email");
        $stmt->execute([':email' => $email]);
        return $stmt->fetch() ?: null;
    }

    public function subscribe(string $email): int {
        $stmt = $this->pdo->prepare("INSERT INTO {$this->table} (email) VALUES (:email)");
        $stmt->execute([':email' => $email]);
        return (int)$this->pdo->lastInsertId();
    }

    public function delete(int $id): bool {
        $stmt = $this->pdo->prepare("DELETE FROM {$this->table} WHERE id = :id");
        return $stmt->execute([':id' => $id]) && $stmt->rowCount() > 0;
    }

    public function stats(): array {
        $total     = (int)$this->pdo->query("SELECT COUNT(*) FROM {$this->table}")->fetchColumn();
        $thisMonth = (int)$this->pdo->query("SELECT COUNT(*) FROM {$this->table} WHERE MONTH(subscribed_at)=MONTH(NOW()) AND YEAR(subscribed_at)=YEAR(NOW())")->fetchColumn();
        $last      = $this->pdo->query("SELECT email, subscribed_at FROM {$this->table} ORDER BY subscribed_at DESC LIMIT 1")->fetch();

        return [
            'total'      => $total,
            'this_month' => $thisMonth,
            'last_sub'   => $last ?: null,
        ];
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLASSE : NewsletterController
// ═══════════════════════════════════════════════════════════════════════════════
class NewsletterController {

    private NewsletterRepository $repo;

    public function __construct(PDO $pdo) {
        $this->repo = new NewsletterRepository($pdo);
    }

    private function json(array $data, int $code = 200): void {
        http_response_code($code);
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit();
    }

    // ── POST — inscription ────────────────────────────────────────────────────
    public function subscribe(): void {
        $data  = json_decode(file_get_contents('php://input'), true) ?? [];
        $email = filter_var(trim($data['email'] ?? ''), FILTER_SANITIZE_EMAIL);

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->json(['success' => false, 'message' => 'Email invalide.'], 400);
        }

        if ($this->repo->findByEmail($email)) {
            $this->json(['success' => true, 'message' => 'Vous êtes déjà inscrit à notre newsletter.']);
        }

        $this->repo->subscribe($email);
        $this->json(['success' => true, 'message' => 'Merci pour votre inscription !']);
    }

    // ── GET ?action=list ──────────────────────────────────────────────────────
    public function index(): void {
        $subs  = $this->repo->findAll();
        $stats = $this->repo->stats();
        $this->json(['success' => true, 'subscribers' => $subs, 'stats' => $stats]);
    }

    // ── DELETE ?action=delete&id=X ────────────────────────────────────────────
    public function destroy(int $id): void {
        if ($id <= 0) $this->json(['success' => false, 'message' => 'ID invalide'], 400);

        $ok = $this->repo->delete($id);
        $this->json([
            'success' => $ok,
            'message' => $ok ? 'Abonné supprimé avec succès' : 'Abonné non trouvé',
        ], $ok ? 200 : 404);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROUTEUR
// ═══════════════════════════════════════════════════════════════════════════════
try {
    $pdo        = (new Database())->getConnection();
    $controller = new NewsletterController($pdo);
    $method     = $_SERVER['REQUEST_METHOD'];
    $action     = $_GET['action'] ?? '';
    $id         = (int)($_GET['id'] ?? 0);

    match (true) {
        $method === 'POST'   && $action === ''       => $controller->subscribe(),
        $method === 'GET'    && $action === 'list'   => $controller->index(),
        $method === 'DELETE' && $action === 'delete' => $controller->destroy($id),
        default => (function() use ($method, $action) {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => "Méthode non autorisée : {$method} {$action}"]);
        })()
    };
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>