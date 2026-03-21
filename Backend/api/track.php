<?php
// Backend/api/track.php
// Appelé automatiquement depuis le frontend à chaque page visitée

header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'POST uniquement']);
    exit();
}

require_once __DIR__ . '/../config/database.php';

// ═══════════════════════════════════════════════════════════════════════════════
// CLASSE : TrackingService — enregistre les visites dans analytics
// ═══════════════════════════════════════════════════════════════════════════════
class TrackingService {

    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    // ── Enregistrer une visite ────────────────────────────────────────────────
    public function track(array $data): array {
        $sessionId  = $this->sanitizeSession($data['session_id'] ?? '');
        $page       = substr($data['page']       ?? '/', 0, 500);
        $referrer   = substr($data['referrer']   ?? '', 0, 500);
        $userAgent  = substr($data['user_agent'] ?? '', 0, 500);
        $timeSpent  = (int)($data['time_spent']  ?? 0);

        if (empty($sessionId)) {
            return ['success' => false, 'message' => 'session_id invalide'];
        }

        // Ne pas tracker les pages admin
        if (str_starts_with($page, '/admin') || str_starts_with($page, '/login')) {
            return ['success' => true, 'message' => 'admin_skipped'];
        }

        // Éviter les doublons : même session + même page dans les 30 dernières secondes
        if ($this->isDuplicate($sessionId, $page)) {
            return ['success' => true, 'message' => 'duplicate_skipped'];
        }

        $id = $this->insert($sessionId, $page, $referrer, $userAgent, $timeSpent);

        return ['success' => true, 'id' => $id];
    }

    // ── Vérifier doublon ──────────────────────────────────────────────────────
    private function isDuplicate(string $sessionId, string $page): bool {
        $stmt = $this->pdo->prepare("
            SELECT id FROM analytics
            WHERE session_id = :sid AND referrer = :page
            AND created_at > NOW() - INTERVAL 30 SECOND
            LIMIT 1
        ");
        $stmt->execute([':sid' => $sessionId, ':page' => $page]);
        return (bool)$stmt->fetch();
    }

    // ── Insérer la visite ─────────────────────────────────────────────────────
    private function insert(string $sessionId, string $page, string $referrer, string $userAgent, int $timeSpent): int {
        $stmt = $this->pdo->prepare("
            INSERT INTO analytics (session_id, ip_address, user_agent, referrer, device_type, browser, time_spent, created_at)
            VALUES (:session_id, :ip, :ua, :referrer, :device_type, :browser, :time_spent, NOW())
        ");
        $stmt->execute([
            ':session_id'  => $sessionId,
            ':ip'          => $this->getClientIp(),
            ':ua'          => $userAgent,
            ':referrer'    => $page,
            ':device_type' => $this->detectDevice($userAgent),
            ':browser'     => $this->detectBrowser($userAgent),
            ':time_spent'  => $timeSpent,
        ]);
        return (int)$this->pdo->lastInsertId();
    }

    // ── Détection device ──────────────────────────────────────────────────────
    private function detectDevice(string $ua): string {
        $ua = strtolower($ua);
        if (preg_match('/ipad|tablet/i', $ua))          return 'tablet';
        if (preg_match('/mobile|android|iphone|ipod/i', $ua)) return 'mobile';
        return 'desktop';
    }

    // ── Détection navigateur ──────────────────────────────────────────────────
    private function detectBrowser(string $ua): string {
        $ua = strtolower($ua);
        if (str_contains($ua, 'edge'))    return 'Edge';
        if (str_contains($ua, 'chrome'))  return 'Chrome';
        if (str_contains($ua, 'firefox')) return 'Firefox';
        if (str_contains($ua, 'safari'))  return 'Safari';
        return 'Other';
    }

    // ── Récupérer l'IP client ─────────────────────────────────────────────────
    private function getClientIp(): string {
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        return trim(explode(',', $ip)[0]);
    }

    // ── Nettoyer le session_id ────────────────────────────────────────────────
    private function sanitizeSession(string $sid): string {
        return substr(preg_replace('/[^a-zA-Z0-9_\-]/', '', $sid), 0, 100);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROUTEUR
// ═══════════════════════════════════════════════════════════════════════════════
try {
    $pdo     = (new Database())->getConnection();
    $service = new TrackingService($pdo);
    $data    = json_decode(file_get_contents('php://input'), true) ?? [];
    $result  = $service->track($data);

    http_response_code(200);
    echo json_encode($result, JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>