<?php
// Visioad/api/blog.php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/../Backend/config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$db = new Database();
$pdo = $db->getConnection();

switch ($method) {
    case 'GET':
        // Récupérer tous les articles
        $stmt = $pdo->query("
            SELECT id, title, slug, excerpt, content, image_url, 
                   author, category, tags, read_time, views, 
                   is_featured, created_at,
                   DATE_FORMAT(created_at, '%d/%m/%Y') as date_display,
                   CONCAT(read_time, ' min') as read_time_display
            FROM blog_posts 
            ORDER BY created_at DESC
        ");
        $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'data' => $posts
        ]);
        break;
        
    case 'POST':
        // Créer un nouvel article
        $data = json_decode(file_get_contents('php://input'), true);
        
        $sql = "INSERT INTO blog_posts 
                (title, excerpt, content, category, image_url, author, 
                 read_time, is_featured, tags, created_at) 
                VALUES (:title, :excerpt, :content, :category, :image_url, 
                        :author, :read_time, :is_featured, :tags, NOW())";
        
        $stmt = $pdo->prepare($sql);
        $success = $stmt->execute([
            ':title' => $data['title'],
            ':excerpt' => $data['excerpt'],
            ':content' => $data['content'],
            ':category' => $data['category'],
            ':image_url' => $data['image_url'],
            ':author' => $data['author'],
            ':read_time' => $data['read_time'],
            ':is_featured' => $data['is_featured'] ? 1 : 0,
            ':tags' => $data['tags']
        ]);
        
        echo json_encode([
            'success' => $success,
            'post_id' => $success ? $pdo->lastInsertId() : null,
            'message' => $success ? 'Article créé avec succès' : 'Erreur lors de la création'
        ]);
        break;
        
    default:
        echo json_encode([
            'success' => false,
            'message' => 'Méthode non supportée'
        ]);
}
?>