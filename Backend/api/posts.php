<?php
// Backend/api/posts.php - Gestion des articles

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
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
    $jwt = new JWT();
    $decoded = $jwt->decode($token);
    
    if (!$decoded) {
        throw new Exception('Token invalide');
    }
    
    // Vérifier permissions (admin ou éditeur)
    if (!in_array($decoded['role'], ['admin', 'editor'])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Accès refusé']);
        exit();
    }
    
    $db = new Database();
    $pdo = $db->getConnection();
    
    $method = $_SERVER['REQUEST_METHOD'];
    $postId = $_GET['id'] ?? null;
    $action = $_GET['action'] ?? '';
    
    switch ($method) {
        case 'GET':
            if ($postId) {
                getPost($pdo, $postId);
            } else if ($action === 'categories') {
                getCategories($pdo);
            } else if ($action === 'stats') {
                getPostsStats($pdo);
            } else {
                getPosts($pdo);
            }
            break;
            
        case 'POST':
            if ($action === 'create') {
                createPost($pdo, $decoded);
            } else if ($action === 'update') {
                updatePost($pdo, $postId, $decoded);
            }
            break;
            
        case 'PUT':
            updatePost($pdo, $postId, $decoded);
            break;
            
        case 'DELETE':
            deletePost($pdo, $postId);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

function getPosts($pdo) {
    $page = $_GET['page'] ?? 1;
    $limit = $_GET['limit'] ?? 10;
    $search = $_GET['search'] ?? '';
    $category = $_GET['category'] ?? '';
    $featured = $_GET['featured'] ?? '';
    $author = $_GET['author'] ?? '';
    $offset = ($page - 1) * $limit;
    
    $where = [];
    $params = [];
    
    if ($search) {
        $where[] = "(title LIKE :search OR content LIKE :search OR excerpt LIKE :search)";
        $params[':search'] = "%$search%";
    }
    
    if ($category) {
        $where[] = "category = :category";
        $params[':category'] = $category;
    }
    
    if ($featured !== '') {
        $where[] = "is_featured = :featured";
        $params[':featured'] = (bool)$featured ? 1 : 0;
    }
    
    if ($author) {
        $where[] = "author = :author";
        $params[':author'] = $author;
    }
    
    $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';
    
    // Compter total
    $countSql = "SELECT COUNT(*) as total FROM blog_posts $whereClause";
    $countStmt = $pdo->prepare($countSql);
    $countStmt->execute($params);
    $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Récupérer articles
    $sql = "SELECT id, title, slug, content, read_time, views, is_featured, 
                   excerpt, meta_description, image_url, author, author_image,
                   created_at, updated_at, category, tags
            FROM blog_posts 
            $whereClause 
            ORDER BY created_at DESC 
            LIMIT :limit OFFSET :offset";
    
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
    
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    
    $stmt->execute();
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Nettoyer le contenu HTML pour la liste
    foreach ($posts as &$post) {
        $post['excerpt_short'] = strlen($post['excerpt']) > 100 
            ? substr(strip_tags($post['excerpt']), 0, 100) . '...' 
            : strip_tags($post['excerpt']);
    }
    
    echo json_encode([
        'success' => true,
        'posts' => $posts,
        'pagination' => [
            'page' => (int)$page,
            'limit' => (int)$limit,
            'total' => (int)$total,
            'pages' => ceil($total / $limit)
        ]
    ]);
}

function getPost($pdo, $postId) {
    $sql = "SELECT id, title, slug, content, read_time, views, is_featured, 
                   excerpt, meta_description, image_url, author, author_image,
                   created_at, updated_at, category, tags
            FROM blog_posts 
            WHERE id = :id";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':id' => $postId]);
    $post = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$post) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Article non trouvé']);
        return;
    }
    
    // Incrémenter les vues
    $updateStmt = $pdo->prepare("UPDATE blog_posts SET views = views + 1 WHERE id = :id");
    $updateStmt->execute([':id' => $postId]);
    
    echo json_encode([
        'success' => true,
        'post' => $post
    ]);
}

function createPost($pdo, $user) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $required = ['title', 'content'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => "Champ $field manquant"]);
            return;
        }
    }
    
    // Générer slug si non fourni
    $slug = $data['slug'] ?? generateSlug($data['title']);
    
    // Vérifier slug unique
    $checkStmt = $pdo->prepare("SELECT id FROM blog_posts WHERE slug = :slug");
    $checkStmt->execute([':slug' => $slug]);
    if ($checkStmt->fetch()) {
        // Ajouter un suffixe numérique
        $counter = 1;
        while (true) {
            $newSlug = $slug . '-' . $counter;
            $checkStmt->execute([':slug' => $newSlug]);
            if (!$checkStmt->fetch()) {
                $slug = $newSlug;
                break;
            }
            $counter++;
        }
    }
    
    // Calculer read_time si non fourni
    $readTime = $data['read_time'] ?? calculateReadTime($data['content']);
    
    $sql = "INSERT INTO blog_posts 
            (title, slug, content, read_time, views, is_featured, excerpt, 
             meta_description, image_url, author, author_image, category, tags, created_at)
            VALUES 
            (:title, :slug, :content, :read_time, 0, :is_featured, :excerpt, 
             :meta_description, :image_url, :author, :author_image, :category, :tags, NOW())";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':title' => $data['title'],
        ':slug' => $slug,
        ':content' => $data['content'],
        ':read_time' => $readTime,
        ':is_featured' => $data['is_featured'] ?? 0,
        ':excerpt' => $data['excerpt'] ?? substr(strip_tags($data['content']), 0, 200) . '...',
        ':meta_description' => $data['meta_description'] ?? '',
        ':image_url' => $data['image_url'] ?? '/images/blog/default.jpg',
        ':author' => $data['author'] ?? $user['name'] ?? 'Admin',
        ':author_image' => $data['author_image'] ?? null,
        ':category' => $data['category'] ?? null,
        ':tags' => $data['tags'] ?? null
    ]);
    
    $postId = $pdo->lastInsertId();
    
    // Récupérer l'article créé
    $stmt = $pdo->prepare("SELECT * FROM blog_posts WHERE id = :id");
    $stmt->execute([':id' => $postId]);
    $post = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'message' => 'Article créé avec succès',
        'post' => $post
    ]);
}

function updatePost($pdo, $postId, $user) {
    if (!$postId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID article requis']);
        return;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Vérifier si l'article existe
    $checkStmt = $pdo->prepare("SELECT id FROM blog_posts WHERE id = :id");
    $checkStmt->execute([':id' => $postId]);
    if (!$checkStmt->fetch()) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Article non trouvé']);
        return;
    }
    
    // Construire la requête
    $fields = [];
    $params = [':id' => $postId];
    
    if (isset($data['title'])) {
        $fields[] = "title = :title";
        $params[':title'] = $data['title'];
        
        // Regénérer slug si titre changé
        if (!isset($data['slug'])) {
            $fields[] = "slug = :slug";
            $params[':slug'] = generateSlug($data['title']);
        }
    }
    
    if (isset($data['slug'])) {
        $fields[] = "slug = :slug";
        $params[':slug'] = $data['slug'];
    }
    
    if (isset($data['content'])) {
        $fields[] = "content = :content";
        $params[':content'] = $data['content'];
        
        // Recalculer read_time
        if (!isset($data['read_time'])) {
            $fields[] = "read_time = :read_time";
            $params[':read_time'] = calculateReadTime($data['content']);
        }
    }
    
    if (isset($data['read_time'])) {
        $fields[] = "read_time = :read_time";
        $params[':read_time'] = $data['read_time'];
    }
    
    if (isset($data['is_featured'])) {
        $fields[] = "is_featured = :is_featured";
        $params[':is_featured'] = (bool)$data['is_featured'] ? 1 : 0;
    }
    
    if (isset($data['excerpt'])) {
        $fields[] = "excerpt = :excerpt";
        $params[':excerpt'] = $data['excerpt'];
    }
    
    if (isset($data['meta_description'])) {
        $fields[] = "meta_description = :meta_description";
        $params[':meta_description'] = $data['meta_description'];
    }
    
    if (isset($data['image_url'])) {
        $fields[] = "image_url = :image_url";
        $params[':image_url'] = $data['image_url'];
    }
    
    if (isset($data['author'])) {
        $fields[] = "author = :author";
        $params[':author'] = $data['author'];
    }
    
    if (isset($data['author_image'])) {
        $fields[] = "author_image = :author_image";
        $params[':author_image'] = $data['author_image'];
    }
    
    if (isset($data['category'])) {
        $fields[] = "category = :category";
        $params[':category'] = $data['category'];
    }
    
    if (isset($data['tags'])) {
        $fields[] = "tags = :tags";
        $params[':tags'] = $data['tags'];
    }
    
    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Aucune donnée à mettre à jour']);
        return;
    }
    
    $fields[] = "updated_at = NOW()";
    
    $sql = "UPDATE blog_posts SET " . implode(', ', $fields) . " WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    // Récupérer l'article mis à jour
    $stmt = $pdo->prepare("SELECT * FROM blog_posts WHERE id = :id");
    $stmt->execute([':id' => $postId]);
    $post = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'message' => 'Article mis à jour avec succès',
        'post' => $post
    ]);
}

function deletePost($pdo, $postId) {
    if (!$postId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID article requis']);
        return;
    }
    
    // Vérifier si l'article existe
    $checkStmt = $pdo->prepare("SELECT title FROM blog_posts WHERE id = :id");
    $checkStmt->execute([':id' => $postId]);
    $post = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$post) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Article non trouvé']);
        return;
    }
    
    // Supprimer l'article
    $stmt = $pdo->prepare("DELETE FROM blog_posts WHERE id = :id");
    $stmt->execute([':id' => $postId]);
    
    echo json_encode([
        'success' => true,
        'message' => "Article '{$post['title']}' supprimé avec succès"
    ]);
}

function getCategories($pdo) {
    $stmt = $pdo->query("
        SELECT category, COUNT(*) as count 
        FROM blog_posts 
        WHERE category IS NOT NULL AND category != ''
        GROUP BY category 
        ORDER BY count DESC
    ");
    
    $categories = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $categories[] = [
            'name' => $row['category'],
            'count' => (int)$row['count']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'categories' => $categories
    ]);
}

function getPostsStats($pdo) {
    $stats = [];
    
    // Total par catégorie
    $stmt = $pdo->query("
        SELECT category, COUNT(*) as count 
        FROM blog_posts 
        WHERE category IS NOT NULL 
        GROUP BY category
        ORDER BY count DESC
        LIMIT 5
    ");
    
    $byCategory = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $byCategory[] = [
            'category' => $row['category'] ?: 'Non catégorisé',
            'count' => (int)$row['count']
        ];
    }
    
    // Articles par auteur
    $stmt = $pdo->query("
        SELECT author, COUNT(*) as count 
        FROM blog_posts 
        WHERE author IS NOT NULL 
        GROUP BY author
        ORDER BY count DESC
        LIMIT 5
    ");
    
    $byAuthor = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $byAuthor[] = [
            'author' => $row['author'],
            'count' => (int)$row['count']
        ];
    }
    
    // Articles par mois
    $stmt = $pdo->query("
        SELECT 
            DATE_FORMAT(created_at, '%Y-%m') as month,
            COUNT(*) as count
        FROM blog_posts
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month
    ");
    
    $byMonth = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $byMonth[] = [
            'month' => $row['month'],
            'count' => (int)$row['count']
        ];
    }
    
    // Articles les plus vus
    $stmt = $pdo->query("
        SELECT title, views 
        FROM blog_posts 
        ORDER BY views DESC 
        LIMIT 5
    ");
    
    $mostViewed = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $mostViewed[] = [
            'title' => $row['title'],
            'views' => (int)$row['views']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'stats' => [
            'byCategory' => $byCategory,
            'byAuthor' => $byAuthor,
            'byMonth' => $byMonth,
            'mostViewed' => $mostViewed
        ]
    ]);
}

// Fonctions utilitaires
function generateSlug($text) {
    $text = preg_replace('~[^\pL\d]+~u', '-', $text);
    $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);
    $text = preg_replace('~[^-\w]+~', '', $text);
    $text = trim($text, '-');
    $text = preg_replace('~-+~', '-', $text);
    $text = strtolower($text);
    
    return $text ?: 'article';
}

function calculateReadTime($content) {
    // Environ 200 mots par minute
    $wordCount = str_word_count(strip_tags($content));
    $minutes = ceil($wordCount / 200);
    return max(1, $minutes); // Minimum 1 minute
}
?>