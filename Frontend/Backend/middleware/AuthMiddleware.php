<?php
// Backend/middleware/AuthMiddleware.php

require_once __DIR__ . '/../utils/JWT.php';

class AuthMiddleware {

    // ── Authentifier (token présent et valide) ────────────────────────────────
    public static function authenticate(): array {
        $token = self::getBearerToken();

        if (!$token) {
            self::abort(401, 'Authentification requise');
        }

        try {
            $jwt     = new JWT();
            $payload = $jwt->decode($token);

            if (!$payload) {
                self::abort(401, 'Token invalide');
            }

            return $payload;
        } catch (Exception $e) {
            self::abort(401, 'Token invalide ou expiré');
        }
    }

    // ── Autoriser selon le rôle ───────────────────────────────────────────────
    public static function authorize(string $requiredRole = 'admin'): array {
        $user = self::authenticate();

        // ✅ client supprimé — seulement visitor et admin
        $hierarchy = ['visitor' => 1, 'admin' => 2];
        $userLevel = $hierarchy[$user['role']] ?? 0;
        $reqLevel  = $hierarchy[$requiredRole] ?? 99;

        if ($userLevel < $reqLevel) {
            self::abort(403, 'Permissions insuffisantes');
        }

        return $user;
    }

    // ── Autoriser selon une permission DB ─────────────────────────────────────
    public static function authorizePermission(PDO $pdo, string $permission): array {
        $user = self::authenticate();

        $stmt = $pdo->prepare("
            SELECT COUNT(*) FROM permissions p
            JOIN role_permissions rp ON p.id = rp.permission_id
            WHERE rp.role = :role AND p.name = :perm
        ");
        $stmt->execute([':role' => $user['role'], ':perm' => $permission]);

        if (!$stmt->fetchColumn()) {
            self::abort(403, 'Permission refusée');
        }

        return $user;
    }

    // ── Extraire le Bearer token ──────────────────────────────────────────────
    // ✅ Corrigé — lisait $_COOKIE au lieu du header Authorization
    public static function getBearerToken(): ?string {
        $headers = getallheaders();
        $auth    = $headers['Authorization'] ?? $headers['authorization'] ?? '';

        if (str_starts_with($auth, 'Bearer ')) {
            return substr($auth, 7);
        }

        // Fallback : cookie access_token (pour usage futur)
        if (!empty($_COOKIE['access_token'])) {
            return $_COOKIE['access_token'];
        }

        return null;
    }

    // ── Réponse d'erreur et arrêt ─────────────────────────────────────────────
    private static function abort(int $code, string $message): never {
        http_response_code($code);
        echo json_encode(['success' => false, 'message' => $message]);
        exit();
    }
}
?>