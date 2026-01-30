<?php
// Backend/api/dashboard.php - API dashboard complet

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Origin, Content-Type, Authorization, Accept, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/JWT.php';

// Vérifier l'authentification
$headers = getallheaders();
$token = null;

if (isset($headers['Authorization'])) {
    $authHeader = $headers['Authorization'];
    if (strpos($authHeader, 'Bearer ') === 0) {
        $token = substr($authHeader, 7);
    }
}

if (empty($token)) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Token manquant']);
    exit();
}

try {
    // Valider le token
    $jwt = new JWT();
    $decoded = $jwt->decode($token);
    
    if (!$decoded) {
        throw new Exception('Token invalide');
    }
    
    // Vérifier le rôle admin
    if ($decoded['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Accès refusé - Admin seulement']);
        exit();
    }
    
    $db = new Database();
    $pdo = $db->getConnection();
    
    $action = $_GET['action'] ?? 'stats';
    
    switch ($action) {
        case 'stats':
            getStats($pdo);
            break;
            
        case 'charts':
            getChartsData($pdo);
            break;
            
        case 'recent':
            getRecentActivity($pdo);
            break;
            
        default:
            getStats($pdo);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur serveur: ' . $e->getMessage()
    ]);
}

function getStats($pdo) {
    // 1. Statistiques utilisateurs
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM users");
    $totalUsers = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Utilisateurs par rôle
    $stmt = $pdo->query("
        SELECT role, COUNT(*) as count 
        FROM users 
        GROUP BY role
    ");
    $usersByRole = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $usersByRole[$row['role']] = (int)$row['count'];
    }
    
    // 2. Statistiques articles
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM blog_posts");
    $totalPosts = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Articles par catégorie
    $stmt = $pdo->query("
        SELECT category, COUNT(*) as count 
        FROM blog_posts 
        WHERE category IS NOT NULL 
        GROUP BY category
        ORDER BY count DESC
        LIMIT 5
    ");
    $postsByCategory = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $postsByCategory[] = [
            'category' => $row['category'] ?: 'Non catégorisé',
            'count' => (int)$row['count']
        ];
    }
    
    // 3. Statistiques contacts
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM contacts");
    $totalContacts = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Contacts par statut
    $stmt = $pdo->query("
        SELECT status, COUNT(*) as count 
        FROM contacts 
        GROUP BY status
    ");
    $contactsByStatus = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $contactsByStatus[$row['status']] = (int)$row['count'];
    }
    
    // 4. Newsletter
    try {
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM newsletter_subscribers WHERE status = 'active'");
        $newsletterSubscribers = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    } catch (Exception $e) {
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM newsletter");
        $newsletterSubscribers = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    }
    
    // 5. Commentaires
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM blog_comments");
    $totalComments = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // 6. Sessions aujourd'hui
    $stmt = $pdo->query("
        SELECT COUNT(DISTINCT session_id) as total 
        FROM analytics 
        WHERE DATE(created_at) = CURDATE()
    ");
    $todaySessions = $stmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;
    
    // 7. Croissance mensuelle
    $stmt = $pdo->query("
        SELECT 
            COUNT(*) as current_month,
            (SELECT COUNT(*) FROM users WHERE MONTH(created_at) = MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH))) as last_month
        FROM users 
        WHERE MONTH(created_at) = MONTH(NOW())
    ");
    $growth = $stmt->fetch(PDO::FETCH_ASSOC);
    $monthlyGrowth = $growth['last_month'] > 0 
        ? round((($growth['current_month'] - $growth['last_month']) / $growth['last_month']) * 100, 1)
        : 100;
    
    echo json_encode([
        'success' => true,
        'stats' => [
            'totalUsers' => (int)$totalUsers,
            'totalPosts' => (int)$totalPosts,
            'totalContacts' => (int)$totalContacts,
            'totalComments' => (int)$totalComments,
            'newsletterSubscribers' => (int)$newsletterSubscribers,
            'todaySessions' => (int)$todaySessions,
            'monthlyGrowth' => $monthlyGrowth
        ],
        'breakdown' => [
            'usersByRole' => $usersByRole,
            'postsByCategory' => $postsByCategory,
            'contactsByStatus' => $contactsByStatus
        ],
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}

function getChartsData($pdo) {
    // Données pour les graphiques
    
    // 1. Utilisateurs par mois (6 derniers mois)
    $stmt = $pdo->query("
        SELECT 
            DATE_FORMAT(created_at, '%Y-%m') as month,
            COUNT(*) as count
        FROM users
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month
    ");
    
    $usersByMonth = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $usersByMonth[] = [
            'month' => $row['month'],
            'count' => (int)$row['count']
        ];
    }
    
    // 2. Vues d'articles populaires
    $stmt = $pdo->query("
        SELECT title, views 
        FROM blog_posts 
        ORDER BY views DESC 
        LIMIT 5
    ");
    
    $popularPosts = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $popularPosts[] = [
            'title' => $row['title'],
            'views' => (int)$row['views']
        ];
    }
    
    // 3. Traffic par appareil
    $stmt = $pdo->query("
        SELECT device_type, COUNT(*) as count 
        FROM analytics 
        WHERE device_type IS NOT NULL 
        GROUP BY device_type
    ");
    
    $trafficByDevice = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $trafficByDevice[] = [
            'device' => $row['device_type'],
            'count' => (int)$row['count']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'charts' => [
            'usersByMonth' => $usersByMonth,
            'popularPosts' => $popularPosts,
            'trafficByDevice' => $trafficByDevice
        ]
    ]);
}

function getRecentActivity($pdo) {
    $activities = [];
    
    // Connexions récentes
    $stmt = $pdo->query("
        SELECT 
            u.username,
            u.role,
            us.created_at,
            'Connexion' as type,
            CONCAT(u.username, ' s\'est connecté') as description
        FROM user_sessions us
        JOIN users u ON us.user_id = u.id
        ORDER BY us.created_at DESC 
        LIMIT 5
    ");
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $activities[] = [
            'id' => uniqid(),
            'user' => $row['username'],
            'type' => $row['type'],
            'description' => $row['description'],
            'time' => timeAgo($row['created_at']),
            'icon' => 'login',
            'color' => 'blue'
        ];
    }
    
    // Nouveaux contacts
    $stmt = $pdo->query("
        SELECT 
            name,
            email,
            created_at,
            'Nouveau contact' as type,
            CONCAT(name, ' a envoyé un message') as description
        FROM contacts 
        ORDER BY created_at DESC 
        LIMIT 5
    ");
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $activities[] = [
            'id' => uniqid(),
            'user' => $row['name'],
            'type' => $row['type'],
            'description' => $row['description'],
            'time' => timeAgo($row['created_at']),
            'icon' => 'mail',
            'color' => 'purple'
        ];
    }
    
    // Nouveaux articles
    $stmt = $pdo->query("
        SELECT 
            title,
            author,
            created_at,
            'Nouvel article' as type,
            CONCAT('Article publié: ', title) as description
        FROM blog_posts 
        ORDER BY created_at DESC 
        LIMIT 3
    ");
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $activities[] = [
            'id' => uniqid(),
            'user' => $row['author'],
            'type' => $row['type'],
            'description' => $row['description'],
            'time' => timeAgo($row['created_at']),
            'icon' => 'file',
            'color' => 'green'
        ];
    }
    
    // Trier par date et limiter
    usort($activities, function($a, $b) {
        return strtotime($b['time']) - strtotime($a['time']);
    });
    
    $activities = array_slice($activities, 0, 8);
    
    echo json_encode([
        'success' => true,
        'activities' => $activities
    ]);
}

function timeAgo($datetime) {
    $time = strtotime($datetime);
    $now = time();
    $diff = $now - $time;
    
    if ($diff < 60) return 'À l\'instant';
    if ($diff < 3600) return 'Il y a ' . floor($diff / 60) . ' min';
    if ($diff < 86400) return 'Il y a ' . floor($diff / 3600) . ' h';
    if ($diff < 604800) return 'Il y a ' . floor($diff / 86400) . ' j';
    return date('d/m/Y', $time);
}
?>