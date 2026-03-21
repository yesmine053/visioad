<?php
// Backend/api/analytics.php

header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../config/database.php';

// ═══════════════════════════════════════════════════════════════════════════════
// CLASSE : AnalyticsRepository
// ═══════════════════════════════════════════════════════════════════════════════
class AnalyticsRepository {

    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    // ── Données quotidiennes ──────────────────────────────────────────────────
    public function getDaily(int $days): array {
        $stmt = $this->pdo->prepare("
            SELECT DATE(created_at)           AS day,
                   COUNT(DISTINCT ip_address) AS visitors,
                   COUNT(DISTINCT session_id) AS sessions
            FROM analytics
            WHERE created_at >= NOW() - INTERVAL :days DAY
            GROUP BY DATE(created_at) ORDER BY day ASC
        ");
        $stmt->bindParam(':days', $days, PDO::PARAM_INT);
        $stmt->execute();

        return array_map(fn($r) => [
            'date'     => (new DateTime($r['day']))->format('d M'),
            'visitors' => (int)$r['visitors'],
            'sessions' => (int)$r['sessions'],
        ], $stmt->fetchAll());
    }

    // ── Données mensuelles ────────────────────────────────────────────────────
    public function getMonthly(): array {
        $stmt = $this->pdo->query("
            SELECT DATE_FORMAT(created_at,'%b') AS month,
                   MONTH(created_at)             AS month_num,
                   COUNT(DISTINCT ip_address)    AS visitors,
                   COUNT(DISTINCT session_id)    AS sessions
            FROM analytics
            WHERE created_at >= NOW() - INTERVAL 12 MONTH
            GROUP BY month_num, month ORDER BY month_num ASC
        ");
        return array_map(fn($r) => [
            'month'    => $r['month'],
            'visitors' => (int)$r['visitors'],
            'sessions' => (int)$r['sessions'],
        ], $stmt->fetchAll());
    }

    // ── Totaux ────────────────────────────────────────────────────────────────
    public function getTotals(int $days): array {
        $stmt = $this->pdo->prepare("
            SELECT COUNT(DISTINCT ip_address) AS total_visitors,
                   COUNT(DISTINCT session_id) AS total_sessions,
                   COUNT(*)                   AS total_hits
            FROM analytics
            WHERE created_at >= NOW() - INTERVAL :days DAY
        ");
        $stmt->bindParam(':days', $days, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch() ?: [];
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLASSE : AnalyticsController
// ═══════════════════════════════════════════════════════════════════════════════
class AnalyticsController {

    private AnalyticsRepository $repo;

    public function __construct(PDO $pdo) {
        $this->repo = new AnalyticsRepository($pdo);
    }

    public function getData(string $period): void {
        $days    = match($period) { '90d' => 90, '12m' => 365, default => 30 };
        $daily   = $this->repo->getDaily($days);
        $monthly = $this->repo->getMonthly();
        $totals  = $this->repo->getTotals($days);

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'period'  => $period,
            'daily'   => $daily,
            'monthly' => $monthly,
            'totals'  => $totals,
            'hasData' => count($daily) > 0,
        ], JSON_UNESCAPED_UNICODE);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROUTEUR
// ═══════════════════════════════════════════════════════════════════════════════
try {
    $pdo        = (new Database())->getConnection();
    $controller = new AnalyticsController($pdo);
    $period     = $_GET['period'] ?? $_GET['action'] ?? '30d';
    $controller->getData($period);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>