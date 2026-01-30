<?php
// backend/api/analytics.php

header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/../config/database.php';

$action = $_GET['action'] ?? 'overview';
$period = $_GET['period'] ?? 'month'; // day, week, month, year

try {
    switch($action) {
        case 'overview':
            getOverviewStats();
            break;
            
        case 'popular':
            getPopularPosts();
            break;
            
        case 'traffic':
            getTrafficStats($period);
            break;
            
        case 'categories':
            getCategoryStats();
            break;
            
        case 'authors':
            getAuthorStats();
            break;
            
        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Action non reconnue']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur serveur',
        'error' => $e->getMessage()
    ]);
}

function getOverviewStats() {
    global $pdo;
    
    // Total des articles
    $total_posts = $pdo->query("SELECT COUNT(*) as count FROM blog_posts")->fetch()['count'];
    
    // Articles publiés ce mois
    $month_posts = $pdo->query("
        SELECT COUNT(*) as count 
        FROM blog_posts 
        WHERE MONTH(created_at) = MONTH(NOW()) 
        AND YEAR(created_at) = YEAR(NOW())
    ")->fetch()['count'];
    
    // Total des vues
    $total_views = $pdo->query("SELECT SUM(views) as total FROM blog_posts")->fetch()['total'];
    
    // Vues ce mois
    $month_views = $pdo->query("
        SELECT SUM(views) as total 
        FROM blog_posts 
        WHERE MONTH(created_at) = MONTH(NOW()) 
        AND YEAR(created_at) = YEAR(NOW())
    ")->fetch()['total'];
    
    // Commentaires en attente
    $pending_comments = $pdo->query("
        SELECT COUNT(*) as count 
        FROM blog_comments 
        WHERE status = 'pending'
    ")->fetch()['count'];
    
    // Articles en vedette
    $featured_posts = $pdo->query("
        SELECT COUNT(*) as count 
        FROM blog_posts 
        WHERE is_featured = TRUE
    ")->fetch()['count'];
    
    // Moyenne du temps de lecture
    $avg_read_time = $pdo->query("
        SELECT AVG(read_time) as avg 
        FROM blog_posts
    ")->fetch()['avg'];
    
    echo json_encode([
        'success' => true,
        'data' => [
            'total_posts' => (int)$total_posts,
            'month_posts' => (int)$month_posts,
            'total_views' => (int)$total_views,
            'month_views' => (int)$month_views,
            'pending_comments' => (int)$pending_comments,
            'featured_posts' => (int)$featured_posts,
            'avg_read_time' => round($avg_read_time, 1),
            'avg_views_per_post' => $total_posts > 0 ? round($total_views / $total_posts, 1) : 0
        ]
    ]);
}

function getPopularPosts() {
    global $pdo;
    
    $limit = $_GET['limit'] ?? 10;
    
    $sql = "
        SELECT id, title, slug, views, 
               DATE_FORMAT(created_at, '%d/%m/%Y') as date_display,
               CONCAT(FLOOR(read_time / 60), 'h ', MOD(read_time, 60), 'min') as read_time_display,
               ROUND(views / DATEDIFF(NOW(), created_at), 2) as views_per_day
        FROM blog_posts 
        ORDER BY views DESC 
        LIMIT :limit
    ";
    
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
    $stmt->execute();
    
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'data' => $posts
    ]);
}

function getTrafficStats($period) {
    global $pdo;
    
    // Selon la période, ajuster la requête
    switch($period) {
        case 'day':
            $interval = '1 DAY';
            $format = '%H:00';
            break;
        case 'week':
            $interval = '7 DAY';
            $format = '%W';
            break;
        case 'month':
            $interval = '30 DAY';
            $format = '%d/%m';
            break;
        case 'year':
            $interval = '365 DAY';
            $format = '%M';
            break;
        default:
            $interval = '30 DAY';
            $format = '%d/%m';
    }
    
    $sql = "
        SELECT 
            DATE_FORMAT(created_at, :format) as period,
            COUNT(*) as posts_count,
            SUM(views) as total_views,
            AVG(views) as avg_views,
            COUNT(DISTINCT author) as authors_count
        FROM blog_posts 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL $interval)
        GROUP BY period
        ORDER BY MIN(created_at)
    ";
    
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':format', $format);
    $stmt->execute();
    
    $stats = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'data' => $stats,
        'period' => $period
    ]);
}

function getCategoryStats() {
    global $pdo;
    
    $sql = "
        SELECT 
            category,
            COUNT(*) as posts_count,
            SUM(views) as total_views,
            AVG(views) as avg_views,
            AVG(read_time) as avg_read_time,
            SUM(CASE WHEN is_featured = TRUE THEN 1 ELSE 0 END) as featured_count
        FROM blog_posts 
        GROUP BY category
        ORDER BY total_views DESC
    ";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Calculer les pourcentages
    $total_views = array_sum(array_column($categories, 'total_views'));
    foreach ($categories as &$category) {
        $category['views_percentage'] = $total_views > 0 
            ? round(($category['total_views'] / $total_views) * 100, 1)
            : 0;
    }
    
    echo json_encode([
        'success' => true,
        'data' => $categories,
        'total_views' => $total_views
    ]);
}
?>