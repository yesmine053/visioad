<?php
// Backend/api/dashboard.php

header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

// ═══════════════════════════════════════════════════════════════════════════════
// CLASSE : DashboardRepository — requêtes SQL
// ═══════════════════════════════════════════════════════════════════════════════
class DashboardRepository {

    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    // ── Stats globales ────────────────────────────────────────────────────────
    public function getStats(): array {
        $totalUsers    = (int)$this->pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
        $totalPosts    = (int)$this->pdo->query("SELECT COUNT(*) FROM blog_posts")->fetchColumn();
        $totalContacts = (int)$this->pdo->query("SELECT COUNT(*) FROM contacts")->fetchColumn();
        $newContacts   = (int)$this->pdo->query("SELECT COUNT(*) FROM contacts WHERE status = 'new' OR status IS NULL")->fetchColumn();

        $totalComments = 0;
        try { $totalComments = (int)$this->pdo->query("SELECT COUNT(*) FROM blog_comments")->fetchColumn(); } catch(Exception $e){}

        $newsletter = 0;
        try { $newsletter = (int)$this->pdo->query("SELECT COUNT(*) FROM newsletter")->fetchColumn(); } catch(Exception $e){}

        $todaySessions = 0;
        try { $todaySessions = (int)$this->pdo->query("SELECT COUNT(*) FROM user_sessions WHERE DATE(created_at) = CURDATE()")->fetchColumn(); } catch(Exception $e){}

        $thisMonth = (int)$this->pdo->query("SELECT COUNT(*) FROM users WHERE MONTH(created_at)=MONTH(NOW()) AND YEAR(created_at)=YEAR(NOW())")->fetchColumn();
        $lastMonth = (int)$this->pdo->query("SELECT COUNT(*) FROM users WHERE MONTH(created_at)=MONTH(NOW()-INTERVAL 1 MONTH) AND YEAR(created_at)=YEAR(NOW()-INTERVAL 1 MONTH)")->fetchColumn();
        $growth    = $lastMonth > 0 ? round((($thisMonth - $lastMonth) / $lastMonth) * 100, 1) : 0;

        // Répartition rôles
        $roleRows = $this->pdo->query("SELECT role, COUNT(*) as c FROM users GROUP BY role")->fetchAll();
        $byRole   = ['admin' => 0,  'visitor' => 0];
        foreach ($roleRows as $r) $byRole[$r['role']] = (int)$r['c'];

        // Articles par catégorie
        $postsByCat = $this->pdo->query("SELECT category, COUNT(*) as count FROM blog_posts GROUP BY category ORDER BY count DESC LIMIT 5")->fetchAll();

        // Contacts par statut
        $contRows = $this->pdo->query("SELECT COALESCE(status,'new') as status, COUNT(*) as count FROM contacts GROUP BY status")->fetchAll();
        $byStatus = ['new' => 0, 'read' => 0, 'replied' => 0];
        foreach ($contRows as $r) $byStatus[$r['status']] = (int)$r['count'];

        return [
            'stats' => [
                'totalUsers'            => $totalUsers,
                'totalPosts'            => $totalPosts,
                'totalContacts'         => $totalContacts,
                'newContacts'           => $newContacts,
                'totalComments'         => $totalComments,
                'newsletterSubscribers' => $newsletter,
                'monthlyGrowth'         => $growth,
                'todaySessions'         => $todaySessions,
            ],
            'breakdown' => [
                'usersByRole'      => $byRole,
                'postsByCategory'  => $postsByCat,
                'contactsByStatus' => $byStatus,
            ],
        ];
    }

    // ── Activités récentes ────────────────────────────────────────────────────
    public function getRecent(): array {
        $activities = [];

        // Derniers utilisateurs
        $users = $this->pdo->query("SELECT username, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 3")->fetchAll();
        foreach ($users as $u) {
            $activities[] = [
                'user'        => $u['username'] ?: $u['email'],
                'type'        => 'Inscription',
                'description' => 'Nouvel utilisateur : ' . ($u['username'] ?: $u['email']) . " ({$u['role']})",
                'time'        => $this->timeAgo($u['created_at']),
                'icon'        => 'user',
                'color'       => 'green',
            ];
        }

        // Derniers contacts
        $contacts = $this->pdo->query("SELECT name, email, created_at FROM contacts ORDER BY created_at DESC LIMIT 3")->fetchAll();
        foreach ($contacts as $c) {
            $activities[] = [
                'user'        => $c['name'] ?: $c['email'],
                'type'        => 'Contact',
                'description' => 'Nouveau message de ' . ($c['name'] ?: $c['email']),
                'time'        => $this->timeAgo($c['created_at']),
                'icon'        => 'mail',
                'color'       => 'purple',
            ];
        }

        // Derniers articles
        try {
            $posts = $this->pdo->query("SELECT title, created_at FROM blog_posts ORDER BY created_at DESC LIMIT 2")->fetchAll();
            foreach ($posts as $p) {
                $activities[] = [
                    'user'        => 'Admin',
                    'type'        => 'Article',
                    'description' => 'Article publié : ' . mb_substr($p['title'], 0, 40),
                    'time'        => $this->timeAgo($p['created_at']),
                    'icon'        => 'file',
                    'color'       => 'blue',
                ];
            }
        } catch(Exception $e) {}

        return array_slice($activities, 0, 8);
    }

    // ── Données graphiques ────────────────────────────────────────────────────
    public function getCharts(): array {
        $usersByMonth = $this->pdo->query("
            SELECT DATE_FORMAT(created_at,'%Y-%m') as month, COUNT(*) as count
            FROM users WHERE created_at >= NOW() - INTERVAL 12 MONTH
            GROUP BY month ORDER BY month ASC
        ")->fetchAll();

        $popularPosts = $this->pdo->query("SELECT title, views FROM blog_posts ORDER BY views DESC LIMIT 5")->fetchAll();

        $contactsByMonth = $this->pdo->query("
            SELECT DATE_FORMAT(created_at,'%Y-%m') as month, COUNT(*) as count
            FROM contacts WHERE created_at >= NOW() - INTERVAL 6 MONTH
            GROUP BY month ORDER BY month ASC
        ")->fetchAll();

        $trafficByDevice = [
            ['device' => 'Desktop', 'count' => 0],
            ['device' => 'Mobile',  'count' => 0],
            ['device' => 'Tablet',  'count' => 0],
        ];
        try {
            $rows = $this->pdo->query("SELECT device_type as device, COUNT(*) as count FROM analytics GROUP BY device_type")->fetchAll();
            if ($rows) $trafficByDevice = $rows;
        } catch(Exception $e) {}

        return compact('usersByMonth', 'popularPosts', 'contactsByMonth', 'trafficByDevice');
    }

    // ── Helper : temps relatif ────────────────────────────────────────────────
    private function timeAgo(?string $datetime): string {
        if (!$datetime) return 'Date inconnue';
        $diff = (new DateTime())->diff(new DateTime($datetime));
        if ($diff->y > 0) return "Il y a {$diff->y} an" . ($diff->y > 1 ? 's' : '');
        if ($diff->m > 0) return "Il y a {$diff->m} mois";
        if ($diff->d > 0) return "Il y a {$diff->d} jour" . ($diff->d > 1 ? 's' : '');
        if ($diff->h > 0) return "Il y a {$diff->h}h";
        if ($diff->i > 0) return "Il y a {$diff->i} min";
        return "À l'instant";
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLASSE : DashboardController
// ═══════════════════════════════════════════════════════════════════════════════
class DashboardController {

    private DashboardRepository $repo;

    public function __construct(PDO $pdo) {
        $this->repo = new DashboardRepository($pdo);
    }

    private function json(array $data, int $code = 200): void {
        http_response_code($code);
        echo json_encode(array_merge(['success' => true], $data), JSON_UNESCAPED_UNICODE);
        exit();
    }

    public function stats(): void {
        $this->json($this->repo->getStats());
    }

    public function recent(): void {
        $this->json(['activities' => $this->repo->getRecent()]);
    }

    public function charts(): void {
        $this->json(['charts' => $this->repo->getCharts()]);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROUTEUR
// ═══════════════════════════════════════════════════════════════════════════════
try {
    AuthMiddleware::getBearerToken() or (function(){
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Token manquant']);
        exit();
    })();

    $pdo        = (new Database())->getConnection();
    $controller = new DashboardController($pdo);
    $action     = $_GET['action'] ?? '';

    match ($action) {
        'stats'  => $controller->stats(),
        'recent' => $controller->recent(),
        'charts' => $controller->charts(),
        default  => (function() {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Action invalide. Valeurs : stats, recent, charts']);
        })()
    };

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur serveur : ' . $e->getMessage()]);
}
?>