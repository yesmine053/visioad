<?php
// D:/xampp/htdocs/visioad/backend/api/blog.php

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$request = explode('/', trim($_SERVER['PATH_INFO'] ?? '', '/'));

// Identifier l'action et l'ID
$action = $request[0] ?? '';
$id = isset($request[1]) ? intval($request[1]) : null;

try {
    switch($method) {
        case 'GET':
            if ($id) {
                getBlogPostById($id);
            } elseif ($action === 'featured') {
                getFeaturedPosts();
            } elseif ($action === 'categories') {
                getCategories();
            } elseif ($action === 'search') {
                searchPosts($_GET['q'] ?? '');
            } else {
                getBlogPosts();
            }
            break;
            
        case 'POST':
            if ($action === 'comment') {
                addComment();
            } else {
                createBlogPost();
            }
            break;
            
        case 'PUT':
            if ($id) {
                updateBlogPost($id);
            }
            break;
            
        case 'DELETE':
            if ($id) {
                deleteBlogPost($id);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur serveur',
        'error' => $e->getMessage()
    ]);
}

function createBlogPost() {
    global $pdo;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validation
    if (empty($data['title']) || empty($data['content'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Titre et contenu requis']);
        return;
    }
    
    // Générer slug
    $slug = createSlug($data['title']);
    
    // Valeurs par défaut
    $excerpt = $data['excerpt'] ?? substr(strip_tags($data['content']), 0, 150) . '...';
    $image_url = $data['image_url'] ?? '/images/blog/default.jpg';
    $author = $data['author'] ?? 'Équipe VisioAD';
    $category = $data['category'] ?? 'Marketing';
    $read_time = intval($data['read_time'] ?? 5);
    $is_featured = boolval($data['is_featured'] ?? false);
    $tags = $data['tags'] ?? $category;
    
    $sql = "INSERT INTO blog_posts 
            (title, slug, excerpt, content, image_url, author, category, tags, read_time, is_featured, created_at) 
            VALUES 
            (:title, :slug, :excerpt, :content, :image_url, :author, :category, :tags, :read_time, :is_featured, NOW())";
    
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':title', $data['title']);
    $stmt->bindParam(':slug', $slug);
    $stmt->bindParam(':excerpt', $excerpt);
    $stmt->bindParam(':content', $data['content']);
    $stmt->bindParam(':image_url', $image_url);
    $stmt->bindParam(':author', $author);
    $stmt->bindParam(':category', $category);
    $stmt->bindParam(':tags', $tags);
    $stmt->bindParam(':read_time', $read_time, PDO::PARAM_INT);
    $stmt->bindParam(':is_featured', $is_featured, PDO::PARAM_BOOL);
    
    if ($stmt->execute()) {
        $post_id = $pdo->lastInsertId();
        echo json_encode([
            'success' => true,
            'message' => 'Article créé avec succès',
            'post_id' => $post_id,
            'slug' => $slug
        ]);
    } else {
        throw new Exception('Erreur lors de la création');
    }
}

function updateBlogPost($id) {
    global $pdo;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Vérifier si l'article existe
    $check_sql = "SELECT id FROM blog_posts WHERE id = :id";
    $check_stmt = $pdo->prepare($check_sql);
    $check_stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $check_stmt->execute();
    
    if (!$check_stmt->fetch()) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Article non trouvé']);
        return;
    }
    
    // Construire la requête dynamiquement
    $updates = [];
    $params = [':id' => $id];
    
    if (isset($data['title'])) {
        $updates[] = "title = :title";
        $params[':title'] = $data['title'];
        
        // Mettre à jour le slug si le titre change
        $updates[] = "slug = :slug";
        $params[':slug'] = createSlug($data['title']);
    }
    
    if (isset($data['excerpt'])) {
        $updates[] = "excerpt = :excerpt";
        $params[':excerpt'] = $data['excerpt'];
    }
    
    if (isset($data['content'])) {
        $updates[] = "content = :content";
        $params[':content'] = $data['content'];
    }
    
    if (isset($data['category'])) {
        $updates[] = "category = :category";
        $params[':category'] = $data['category'];
    }
    
    if (isset($data['image_url'])) {
        $updates[] = "image_url = :image_url";
        $params[':image_url'] = $data['image_url'];
    }
    
    if (isset($data['author'])) {
        $updates[] = "author = :author";
        $params[':author'] = $data['author'];
    }
    
    if (isset($data['tags'])) {
        $updates[] = "tags = :tags";
        $params[':tags'] = $data['tags'];
    }
    
    if (isset($data['read_time'])) {
        $updates[] = "read_time = :read_time";
        $params[':read_time'] = intval($data['read_time']);
    }
    
    if (isset($data['is_featured'])) {
        $updates[] = "is_featured = :is_featured";
        $params[':is_featured'] = boolval($data['is_featured']);
    }
    
    if (empty($updates)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Aucune donnée à mettre à jour']);
        return;
    }
    
    $sql = "UPDATE blog_posts SET " . implode(', ', $updates) . " WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    
    foreach ($params as $key => $value) {
        if (strpos($key, ':is_featured') !== false || strpos($key, ':read_time') !== false) {
            $stmt->bindValue($key, $value, is_bool($value) ? PDO::PARAM_BOOL : PDO::PARAM_INT);
        } else {
            $stmt->bindValue($key, $value);
        }
    }
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Article mis à jour avec succès'
        ]);
    } else {
        throw new Exception('Erreur lors de la mise à jour');
    }
}

function deleteBlogPost($id) {
    global $pdo;
    
    // Supprimer d'abord les commentaires associés
    $delete_comments = "DELETE FROM blog_comments WHERE post_id = :id";
    $stmt1 = $pdo->prepare($delete_comments);
    $stmt1->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt1->execute();
    
    // Supprimer l'article
    $sql = "DELETE FROM blog_posts WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Article supprimé avec succès'
        ]);
    } else {
        throw new Exception('Erreur lors de la suppression');
    }
}

// Fonction pour créer un slug
function createSlug($text) {
    $text = preg_replace('~[^\pL\d]+~u', '-', $text);
    $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);
    $text = preg_replace('~[^-\w]+~', '', $text);
    $text = trim($text, '-');
    $text = preg_replace('~-+~', '-', $text);
    $text = strtolower($text);
    
    if (empty($text)) {
        return 'n-a';
    }
    
    // Ajouter un timestamp pour l'unicité
    return $text . '-' . time();
}

// ... (gardez les autres fonctions existantes: getBlogPosts, getBlogPostById, etc.)
?>