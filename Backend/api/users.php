<?php
// Backend/api/users.php

header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Content-Type, Authorization, Accept, X-Requested-With');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

// ═══════════════════════════════════════════════════════════════════════════════
// CLASSE : UserRepository — accès aux données
// ═══════════════════════════════════════════════════════════════════════════════
class UserRepository {

    private PDO $pdo;

    // Colonnes publiques (sans password)
    private string $publicCols = "id, username, email, role, avatar, bio, status, verified,
                                   last_login, created_at, updated_at, company, phone,
                                   subscription_type, subscription_end";

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    // ── Liste paginée ─────────────────────────────────────────────────────────
    public function findAll(int $page, int $limit, string $search = '', string $role = ''): array {
        $offset = ($page - 1) * $limit;
        $where  = [];
        $params = [];

        if ($search) { $where[] = "(username LIKE :search OR email LIKE :search)"; $params[':search'] = "%{$search}%"; }
        if ($role)   { $where[] = "role = :role"; $params[':role'] = $role; }

        $w     = $where ? 'WHERE ' . implode(' AND ', $where) : '';
        $total = (int)$this->pdo->prepare("SELECT COUNT(*) FROM users {$w}")
                                ->execute($params) ? $this->count($w, $params) : 0;

        $stmt = $this->pdo->prepare("SELECT {$this->publicCols} FROM users {$w} ORDER BY created_at DESC LIMIT :lim OFFSET :off");
        $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':off', $offset, PDO::PARAM_INT);
        foreach ($params as $k => $v) $stmt->bindValue($k, $v);
        $stmt->execute();

        return ['users' => $this->formatAll($stmt->fetchAll()), 'total' => $total];
    }

    // ── Trouver par ID ────────────────────────────────────────────────────────
    public function findById(int $id): ?array {
        $stmt = $this->pdo->prepare("SELECT {$this->publicCols}, address FROM users WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $user = $stmt->fetch();
        return $user ? $this->format($user) : null;
    }

    // ── Vérifier email unique ─────────────────────────────────────────────────
    public function emailExists(string $email, ?int $excludeId = null): bool {
        $sql    = "SELECT id FROM users WHERE email = :email" . ($excludeId ? " AND id != :id" : '');
        $params = [':email' => $email];
        if ($excludeId) $params[':id'] = $excludeId;
        $stmt   = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return (bool)$stmt->fetch();
    }

    // ── Créer ─────────────────────────────────────────────────────────────────
    public function create(array $data): array {
        $stmt = $this->pdo->prepare("
            INSERT INTO users (username, email, password, role, avatar, bio, status, verified,
                               company, phone, address, subscription_type, subscription_end, created_at)
            VALUES (:username, :email, :password, :role, :avatar, :bio, :status, :verified,
                    :company, :phone, :address, :subscription_type, :subscription_end, NOW())
        ");
        $stmt->execute([
            ':username'          => $data['username'],
            ':email'             => $data['email'],
            ':password'          => password_hash($data['password'], PASSWORD_DEFAULT),
            ':role'              => $data['role'],
            ':avatar'            => $data['avatar']            ?? null,
            ':bio'               => $data['bio']               ?? null,
            ':status'            => $data['status']            ?? 'active',
            ':verified'          => $data['verified']          ?? 0,
            ':company'           => $data['company']           ?? null,
            ':phone'             => $data['phone']             ?? null,
            ':address'           => $data['address']           ?? null,
            ':subscription_type' => $data['subscription_type'] ?? 'free',
            ':subscription_end'  => $data['subscription_end']  ?? null,
        ]);
        return $this->findById((int)$this->pdo->lastInsertId());
    }

    // ── Modifier ──────────────────────────────────────────────────────────────
    public function update(int $id, array $data): array {
        $updates = [];
        $params  = [':id' => $id];

        $fields = ['username','email','role','avatar','bio','status','company',
                   'phone','address','subscription_type','subscription_end'];

        foreach ($fields as $f) {
            if (array_key_exists($f, $data)) {
                $updates[]    = "{$f} = :{$f}";
                $params[":{$f}"] = $data[$f];
            }
        }
        if (!empty($data['password'])) {
            $updates[]          = "password = :password";
            $params[':password'] = password_hash($data['password'], PASSWORD_DEFAULT);
        }
        if (isset($data['verified'])) {
            $updates[]           = "verified = :verified";
            $params[':verified'] = (int)(bool)$data['verified'];
        }

        $updates[] = "updated_at = NOW()";

        $this->pdo->prepare("UPDATE users SET " . implode(', ', $updates) . " WHERE id = :id")
                  ->execute($params);

        return $this->findById($id);
    }

    // ── Supprimer ─────────────────────────────────────────────────────────────
    public function delete(int $id): bool {
        $stmt = $this->pdo->prepare("DELETE FROM users WHERE id = :id");
        return $stmt->execute([':id' => $id]) && $stmt->rowCount() > 0;
    }

    // ── Statistiques ──────────────────────────────────────────────────────────
    public function stats(): array {
        $byRole = $this->pdo->query("SELECT role, COUNT(*) as count FROM users GROUP BY role")->fetchAll();

        $byMonth = $this->pdo->query("
            SELECT DATE_FORMAT(created_at,'%Y-%m') as month, COUNT(*) as count
            FROM users WHERE created_at >= NOW() - INTERVAL 6 MONTH
            GROUP BY month ORDER BY month ASC
        ")->fetchAll();

        $byStatus = $this->pdo->query("SELECT status, COUNT(*) as count FROM users GROUP BY status")->fetchAll();

        return compact('byRole', 'byMonth', 'byStatus');
    }

    // ── Helpers privés ────────────────────────────────────────────────────────
    private function format(array $user): array {
        $user['verified'] = (bool)$user['verified'];
        unset($user['password']);
        return $user;
    }

    private function formatAll(array $users): array {
        return array_map(fn($u) => $this->format($u), $users);
    }

    private function count(string $where, array $params): int {
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM users {$where}");
        $stmt->execute($params);
        return (int)$stmt->fetchColumn();
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLASSE : UserController
// ═══════════════════════════════════════════════════════════════════════════════
class UserController {

    private UserRepository $repo;
    private array          $authUser;

    public function __construct(PDO $pdo, array $authUser) {
        $this->repo     = new UserRepository($pdo);
        $this->authUser = $authUser;
    }

    private function json(array $data, int $code = 200): void {
        http_response_code($code);
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit();
    }

    private function body(): array {
        return json_decode(file_get_contents('php://input'), true) ?? [];
    }

    // ── GET / — liste paginée ─────────────────────────────────────────────────
    public function index(): void {
        $page   = (int)($_GET['page']   ?? 1);
        $limit  = (int)($_GET['limit']  ?? 10);
        $search =       $_GET['search'] ?? '';
        $role   =       $_GET['role']   ?? '';

        $result = $this->repo->findAll($page, $limit, $search, $role);

        $this->json([
            'success'    => true,
            'users'      => $result['users'],
            'pagination' => [
                'page'  => $page,
                'limit' => $limit,
                'total' => $result['total'],
                'pages' => (int)ceil($result['total'] / $limit),
            ],
        ]);
    }

    // ── GET ?id=X — un utilisateur ────────────────────────────────────────────
    public function show(int $id): void {
        $user = $this->repo->findById($id);
        if (!$user) $this->json(['success' => false, 'message' => 'Utilisateur non trouvé'], 404);
        $this->json(['success' => true, 'user' => $user]);
    }

    // ── POST ?action=create ───────────────────────────────────────────────────
    public function store(): void {
        $data = $this->body();

        foreach (['username', 'email', 'password', 'role'] as $f) {
            if (empty($data[$f])) $this->json(['success' => false, 'message' => "Champ '{$f}' requis"], 400);
        }

        if ($this->repo->emailExists($data['email'])) {
            $this->json(['success' => false, 'message' => 'Email déjà utilisé'], 409);
        }

        $user = $this->repo->create($data);
        $this->json(['success' => true, 'message' => 'Utilisateur créé avec succès', 'user' => $user]);
    }

    // ── PUT ?id=X ─────────────────────────────────────────────────────────────
    public function update(int $id): void {
        if (!$this->repo->findById($id)) {
            $this->json(['success' => false, 'message' => 'Utilisateur non trouvé'], 404);
        }

        $data = $this->body();

        if (isset($data['email']) && $this->repo->emailExists($data['email'], $id)) {
            $this->json(['success' => false, 'message' => 'Email déjà utilisé'], 409);
        }

        if (empty($data)) $this->json(['success' => false, 'message' => 'Aucune donnée'], 400);

        $user = $this->repo->update($id, $data);
        $this->json(['success' => true, 'message' => 'Utilisateur mis à jour avec succès', 'user' => $user]);
    }

    // ── DELETE ?id=X ──────────────────────────────────────────────────────────
    public function destroy(int $id): void {
        // Empêcher la suppression de son propre compte
        if ($id === (int)($this->authUser['id'] ?? 0)) {
            $this->json(['success' => false, 'message' => 'Vous ne pouvez pas supprimer votre propre compte'], 400);
        }

        $user = $this->repo->findById($id);
        if (!$user) $this->json(['success' => false, 'message' => 'Utilisateur non trouvé'], 404);

        $this->repo->delete($id);
        $this->json(['success' => true, 'message' => "Utilisateur {$user['username']} supprimé avec succès"]);
    }

    // ── GET ?action=stats ─────────────────────────────────────────────────────
    public function stats(): void {
        $this->json(['success' => true, 'stats' => $this->repo->stats()]);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROUTEUR
// ═══════════════════════════════════════════════════════════════════════════════
try {
    // Admin seulement
    $authUser   = AuthMiddleware::authorize('admin');
    $pdo        = (new Database())->getConnection();
    $controller = new UserController($pdo, $authUser);

    $method = $_SERVER['REQUEST_METHOD'];
    $action = $_GET['action'] ?? '';
    $id     = isset($_GET['id']) ? (int)$_GET['id'] : null;

    match (true) {
        $method === 'GET'    && $action === 'stats' => $controller->stats(),
        $method === 'GET'    && $id !== null         => $controller->show($id),
        $method === 'GET'                            => $controller->index(),
        $method === 'POST'                           => $controller->store(),
        $method === 'PUT'    && $id !== null         => $controller->update($id),
        $method === 'DELETE' && $id !== null         => $controller->destroy($id),
        default => (function() {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Action non valide']);
        })()
    };

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>