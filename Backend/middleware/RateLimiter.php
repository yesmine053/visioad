<?php
// Backend/middleware/RateLimiter.php

class RateLimiter {

    private PDO $pdo;
    private int $maxAttempts = 5;    // max tentatives
    private int $windowMinutes = 15; // fenêtre de temps en minutes

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    // ── Vérifier si l'IP est bloquée ─────────────────────────────────────────
    public function checkLogin(string $ip): void {
        try {
            $stmt = $this->pdo->prepare("
                SELECT COUNT(*) FROM login_attempts
                WHERE ip = :ip
                AND attempted_at > NOW() - INTERVAL :minutes MINUTE
            ");
            $stmt->execute([':ip' => $ip, ':minutes' => $this->windowMinutes]);
            $count = (int)$stmt->fetchColumn();

            if ($count >= $this->maxAttempts) {
                http_response_code(429);
                echo json_encode([
                    'success' => false,
                    'message' => "Trop de tentatives de connexion. Réessayez dans {$this->windowMinutes} minutes.",
                    'retry_after' => $this->windowMinutes * 60,
                ], JSON_UNESCAPED_UNICODE);
                exit();
            }
        } catch (Exception $e) {
            // Si la table n'existe pas encore, on laisse passer silencieusement
            error_log('[RateLimiter] ' . $e->getMessage());
        }
    }

    // ── Enregistrer une tentative échouée ─────────────────────────────────────
    public function recordAttempt(string $ip): void {
        try {
            $this->pdo->prepare(
                "INSERT INTO login_attempts (ip, attempted_at) VALUES (:ip, NOW())"
            )->execute([':ip' => $ip]);
        } catch (Exception $e) {
            error_log('[RateLimiter] ' . $e->getMessage());
        }
    }

    // ── Réinitialiser après succès ────────────────────────────────────────────
    public function clearAttempts(string $ip): void {
        try {
            $this->pdo->prepare(
                "DELETE FROM login_attempts WHERE ip = :ip"
            )->execute([':ip' => $ip]);
        } catch (Exception $e) {
            error_log('[RateLimiter] ' . $e->getMessage());
        }
    }
}
?>