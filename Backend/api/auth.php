<?php
// Backend/api/auth.php

header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Content-Type, Authorization, Accept, X-Requested-With');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/JWT.php';
require_once __DIR__ . '/../middleware/RateLimiter.php';

// ═══════════════════════════════════════════════════════════════════════════════
// CLASSE : AuthRepository
// ═══════════════════════════════════════════════════════════════════════════════
class AuthRepository {

    private PDO $pdo;

    public function __construct(PDO $pdo) { $this->pdo = $pdo; }

    public function findByEmail(string $email): ?array {
        $stmt = $this->pdo->prepare(
            "SELECT id, username, email, password, role, verified, avatar, status
             FROM users WHERE email = :email LIMIT 1"
        );
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        return $stmt->fetch() ?: null;
    }

    public function findById(int $id): ?array {
        $stmt = $this->pdo->prepare(
            "SELECT id, username, email, role, verified, avatar, status
             FROM users WHERE id = :id LIMIT 1"
        );
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch() ?: null;
    }

    public function emailExists(string $email): bool {
        $stmt = $this->pdo->prepare("SELECT id FROM users WHERE email = :email");
        $stmt->execute([':email' => $email]);
        return (bool)$stmt->fetch();
    }

    public function create(array $data): int {
        $stmt = $this->pdo->prepare(
            "INSERT INTO users (username, email, password, role, verified, created_at)
             VALUES (:username, :email, :password, :role, FALSE, NOW())"
        );
        $stmt->execute([
            ':username' => $data['username'],
            ':email'    => $data['email'],
            ':password' => password_hash($data['password'], PASSWORD_DEFAULT),
            ':role'     => $data['role'],
        ]);
        return (int)$this->pdo->lastInsertId();
    }

    public function updateLastLogin(int $id): void {
        $this->pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = :id")
                  ->execute([':id' => $id]);
    }

    public function getPermissions(string $role): array {
        $stmt = $this->pdo->prepare(
            "SELECT p.name FROM role_permissions rp
             JOIN permissions p ON rp.permission_id = p.id
             WHERE rp.role = :role"
        );
        $stmt->bindParam(':role', $role);
        $stmt->execute();
        return array_column($stmt->fetchAll(), 'name');
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLASSE : AuthController
// ═══════════════════════════════════════════════════════════════════════════════
class AuthController {

    private AuthRepository $repo;
    private JWT            $jwt;
    private PDO            $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo  = $pdo;
        $this->repo = new AuthRepository($pdo);
        $this->jwt  = new JWT();
    }

    private function json(array $data, int $code = 200): void {
        http_response_code($code);
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit();
    }

    private function body(): array {
        return json_decode(file_get_contents('php://input'), true) ?? [];
    }

    private function getBearerToken(): ?string {
        $headers = getallheaders();
        $auth    = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        if (str_starts_with($auth, 'Bearer ')) return substr($auth, 7);
        return $_GET['token'] ?? null;
    }

    private function makeToken(array $user, array $permissions): string {
        return $this->jwt->encode([
            'id'          => $user['id'],
            'email'       => $user['email'],
            'role'        => $user['role'],
            'name'        => $user['username'],
            'permissions' => $permissions,
            'exp'         => time() + 604800,
        ]);
    }

    // ── POST ?action=login ────────────────────────────────────────────────────
    public function login(): void {
        // ✅ Rate limiting — max 5 tentatives par IP en 15 minutes
        $ip      = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        $ip      = trim(explode(',', $ip)[0]);
        $limiter = new RateLimiter($this->pdo);
        $limiter->checkLogin($ip);

        $data = $this->body();

        if (empty($data['email']) || empty($data['password'])) {
            $this->json(['success' => false, 'message' => 'Email et mot de passe requis'], 400);
        }

        $user = $this->repo->findByEmail($data['email']);

        if (!$user || !password_verify($data['password'], $user['password'])) {
            $limiter->recordAttempt($ip); // ✅ Enregistrer l'échec
            $this->json(['success' => false, 'message' => 'Email ou mot de passe incorrect'], 401);
        }

        if ($user['status'] !== 'active') {
            $this->json(['success' => false, 'message' => 'Compte désactivé'], 403);
        }

        $permissions = $this->repo->getPermissions($user['role']);
        $token       = $this->makeToken($user, $permissions);

        $limiter->clearAttempts($ip); // ✅ Succès — réinitialiser le compteur
        $this->repo->updateLastLogin((int)$user['id']);

        $this->json([
            'success'      => true,
            'message'      => 'Connexion réussie',
            'access_token' => $token,
            'expires_in'   => 604800,
            'user'         => [
                'id'       => $user['id'],
                'username' => $user['username'],
                'email'    => $user['email'],
                'role'     => $user['role'],
                'avatar'   => $user['avatar'],
                'verified' => (bool)$user['verified'],
            ],
            'permissions'  => $permissions,
        ]);
    }

    // ── GET ?action=check ─────────────────────────────────────────────────────
    public function check(): void {
        $token = $this->getBearerToken();

        if (!$token) {
            $this->json(['success' => false, 'message' => 'Token manquant', 'authenticated' => false]);
        }

        try {
            $decoded = $this->jwt->decode($token);
            $user    = $this->repo->findById((int)$decoded['id']);

            if (!$user) {
                $this->json(['success' => false, 'message' => 'Utilisateur non trouvé', 'authenticated' => false]);
            }

            $permissions = $this->repo->getPermissions($user['role']);

            $this->json([
                'success'       => true,
                'authenticated' => true,
                'token_valid'   => true,
                'user'          => [
                    'id'       => $user['id'],
                    'username' => $user['username'],
                    'email'    => $user['email'],
                    'role'     => $user['role'],
                    'avatar'   => $user['avatar'],
                    'verified' => (bool)$user['verified'],
                ],
                'permissions'   => $permissions,
                'role'          => $user['role'],
            ]);

        } catch (Exception $e) {
            $this->json([
                'success'       => false,
                'message'       => $e->getMessage(),
                'authenticated' => false,
                'token_expired' => true,
            ]);
        }
    }

    // ── POST ?action=register ─────────────────────────────────────────────────
    public function register(): void {
        $data = $this->body();

        foreach (['username', 'email', 'password', 'role'] as $f) {
            if (empty($data[$f])) {
                $this->json(['success' => false, 'message' => "Champ '{$f}' manquant"], 400);
            }
        }

        if (!in_array($data['role'], ['visitor'])) {
            $this->json(['success' => false, 'message' => 'Rôle non valide'], 400);
        }

        if ($this->repo->emailExists($data['email'])) {
            $this->json(['success' => false, 'message' => 'Cet email est déjà utilisé'], 409);
        }

        $userId      = $this->repo->create($data);
        $permissions = $this->repo->getPermissions($data['role']);
        $token       = $this->makeToken([
            'id' => $userId, 'email' => $data['email'],
            'role' => $data['role'], 'username' => $data['username'],
        ], $permissions);

        $this->json([
            'success'      => true,
            'message'      => 'Compte créé avec succès',
            'access_token' => $token,
            'user'         => [
                'id'       => $userId,
                'username' => $data['username'],
                'email'    => $data['email'],
                'role'     => $data['role'],
                'verified' => false,
            ],
            'permissions'  => $permissions,
        ]);
    }

    // ── POST ?action=logout ───────────────────────────────────────────────────
    public function logout(): void {
        $this->json(['success' => true, 'message' => 'Déconnexion réussie']);
    }

    // ── GET ?action=permissions ───────────────────────────────────────────────
    public function permissions(): void {
        $token = $this->getBearerToken();

        if (!$token) {
            $this->json(['success' => false, 'message' => 'Token manquant'], 401);
        }

        try {
            $decoded     = $this->jwt->decode($token);
            $permissions = $this->repo->getPermissions($decoded['role']);
            $this->json(['success' => true, 'permissions' => $permissions, 'role' => $decoded['role']]);
        } catch (Exception $e) {
            $this->json(['success' => false, 'message' => $e->getMessage()], 401);
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROUTEUR
// ═══════════════════════════════════════════════════════════════════════════════
try {
    $pdo        = (new Database())->getConnection();
    $controller = new AuthController($pdo);
    $action     = $_GET['action'] ?? '';

    match ($action) {
        'login'       => $controller->login(),
        'check'       => $controller->check(),
        'register'    => $controller->register(),
        'logout'      => $controller->logout(),
        'permissions' => $controller->permissions(),
        default       => (function() use ($action) {
            http_response_code(400);
            echo json_encode([
                'success'           => false,
                'message'           => 'Action non supportée',
                'available_actions' => ['login','check','register','logout','permissions'],
            ]);
        })()
    };

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur serveur : ' . $e->getMessage()]);
}
?>