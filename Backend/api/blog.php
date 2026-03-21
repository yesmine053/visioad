<?php
// D:/Xammp/htdocs/visioad/backend/api/blog.php

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/database.php';

// ═══════════════════════════════════════════════════════════════════════════════
// CLASSE : BlogRepository — accès aux données
// ═══════════════════════════════════════════════════════════════════════════════
class BlogRepository {

    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    // ── Utilitaire : slug unique ──────────────────────────────────────────────
    private function createSlug(string $text): string {
        $text = preg_replace('~[^\pL\d]+~u', '-', $text);
        $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);
        $text = preg_replace('~[^-\w]+~', '', $text);
        $text = strtolower(trim($text, '-'));
        $text = preg_replace('~-+~', '-', $text);
        return ($text ?: 'article') . '-' . time();
    }

    // ── GET : liste des articles ──────────────────────────────────────────────
    public function findAll(int $limit = 100, string $sort = 'created_at'): array {
        $allowed = ['views', 'created_at', 'title'];
        $order   = in_array($sort, $allowed) ? $sort : 'created_at';

        $stmt = $this->pdo->prepare("
            SELECT id, title, slug, excerpt, image_url, author, category, tags,
                   read_time, views, is_featured, created_at,
                   DATE_FORMAT(created_at, '%d %M %Y') AS date_display,
                   CONCAT(read_time, ' min')            AS read_time_display
            FROM blog_posts
            ORDER BY {$order} DESC
            LIMIT :limit
        ");
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();

        return array_map(function($p) {
            $p['views']       = (int)$p['views'];
            $p['is_featured'] = (bool)$p['is_featured'];
            return $p;
        }, $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    // ── GET : article par slug ────────────────────────────────────────────────
    public function findBySlug(string $slug): ?array {
        $stmt = $this->pdo->prepare("
            SELECT *, DATE_FORMAT(created_at,'%d %M %Y') AS date_display,
                   CONCAT(read_time,' min') AS read_time_display
            FROM blog_posts WHERE slug = :slug LIMIT 1
        ");
        $stmt->bindParam(':slug', $slug);
        $stmt->execute();
        $post = $stmt->fetch(PDO::FETCH_ASSOC);
        return $post ?: null;
    }

    // ── GET : article par ID ──────────────────────────────────────────────────
    public function findById(int $id): ?array {
        $stmt = $this->pdo->prepare("
            SELECT *, DATE_FORMAT(created_at,'%d %M %Y') AS date_display,
                   CONCAT(read_time,' min') AS read_time_display
            FROM blog_posts WHERE id = :id LIMIT 1
        ");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        $post = $stmt->fetch(PDO::FETCH_ASSOC);
        return $post ?: null;
    }

    // ── GET : articles en vedette ─────────────────────────────────────────────
    public function findFeatured(): array {
        $stmt = $this->pdo->prepare("
            SELECT id, title, slug, excerpt, image_url, author, category,
                   DATE_FORMAT(created_at,'%d %M %Y') AS date_display,
                   CONCAT(read_time,' min')            AS read_time_display,
                   views, is_featured
            FROM blog_posts WHERE is_featured = 1
            ORDER BY views DESC LIMIT 6
        ");
        $stmt->execute();
        return array_map(function($p) {
            $p['is_featured'] = (bool)$p['is_featured'];
            return $p;
        }, $stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    // ── GET : catégories ──────────────────────────────────────────────────────
    public function findCategories(): array {
        $stmt = $this->pdo->query("
            SELECT category, COUNT(*) as count
            FROM blog_posts
            GROUP BY category ORDER BY count DESC
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ── GET : recherche ───────────────────────────────────────────────────────
    public function search(string $query): array {
        if (strlen(trim($query)) < 2) return [];
        $q    = '%' . trim($query) . '%';
        $stmt = $this->pdo->prepare("
            SELECT id, title, slug, excerpt, image_url, author, category, read_time,
                   DATE_FORMAT(created_at,'%d %M %Y') AS date_display,
                   CONCAT(read_time,' min')            AS read_time_display, views
            FROM blog_posts
            WHERE title LIKE :q1 OR excerpt LIKE :q2 OR content LIKE :q3
               OR category LIKE :q4 OR tags LIKE :q5
            ORDER BY views DESC LIMIT 10
        ");
        $stmt->execute([':q1'=>$q,':q2'=>$q,':q3'=>$q,':q4'=>$q,':q5'=>$q]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ── GET : commentaires d'un article ──────────────────────────────────────
    public function findComments(int $postId): array {
        $stmt = $this->pdo->prepare("
            SELECT id, author_name, content,
                   DATE_FORMAT(created_at,'%d %M %Y') AS date_display
            FROM blog_comments
            WHERE post_id = :pid ORDER BY created_at DESC
        ");
        $stmt->bindParam(':pid', $postId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ── GET : articles similaires ─────────────────────────────────────────────
    public function findSimilar(string $category, int $excludeId): array {
        $stmt = $this->pdo->prepare("
            SELECT id, title, slug, image_url,
                   DATE_FORMAT(created_at,'%d %M %Y') AS date_display
            FROM blog_posts
            WHERE category = :cat AND id != :id
            ORDER BY views DESC LIMIT 3
        ");
        $stmt->execute([':cat' => $category, ':id' => $excludeId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ── POST : créer un article ───────────────────────────────────────────────
    public function create(array $data): array {
        $slug        = $this->createSlug($data['title']);
        $excerpt     = $data['excerpt'] ?? substr(strip_tags($data['content']), 0, 150) . '...';
        $image_url   = $data['image_url']   ?? '/images/blog/default.jpg';
        $author      = $data['author']      ?? 'Équipe VisioAD';
        $category    = $data['category']    ?? 'Marketing';
        $read_time   = (int)($data['read_time'] ?? 5);
        $is_featured = isset($data['is_featured']) ? (int)boolval($data['is_featured']) : 0;
        $tags        = $data['tags'] ?? $category;

        $stmt = $this->pdo->prepare("
            INSERT INTO blog_posts
                (title, slug, excerpt, content, image_url, author, category, tags,
                 read_time, is_featured, views, created_at)
            VALUES
                (:title, :slug, :excerpt, :content, :image_url, :author, :category, :tags,
                 :read_time, :is_featured, 0, NOW())
        ");
        $stmt->execute([
            ':title'       => $data['title'],
            ':slug'        => $slug,
            ':excerpt'     => $excerpt,
            ':content'     => $data['content'],
            ':image_url'   => $image_url,
            ':author'      => $author,
            ':category'    => $category,
            ':tags'        => $tags,
            ':read_time'   => $read_time,
            ':is_featured' => $is_featured,
        ]);

        return ['post_id' => (int)$this->pdo->lastInsertId(), 'slug' => $slug];
    }

    // ── PUT : modifier un article ─────────────────────────────────────────────
    public function update(int $id, array $data): bool {
        $updates = [];
        $params  = [':id' => $id];
        $fields  = ['title','excerpt','content','category','image_url','author','tags','read_time','is_featured'];

        foreach ($fields as $f) {
            if (!isset($data[$f])) continue;
            $updates[]     = "{$f} = :{$f}";
            $params[":{$f}"] = match($f) {
                'read_time'   => (int)$data[$f],
                'is_featured' => (int)boolval($data[$f]),
                default       => $data[$f],
            };
        }
        if (isset($data['title'])) {
            $updates[]       = "slug = :slug";
            $params[':slug'] = $this->createSlug($data['title']);
        }
        if (empty($updates)) return false;

        $stmt = $this->pdo->prepare(
            "UPDATE blog_posts SET " . implode(', ', $updates) . " WHERE id = :id"
        );
        foreach ($params as $k => $v) $stmt->bindValue($k, $v);
        return $stmt->execute();
    }

    // ── DELETE : supprimer un article ─────────────────────────────────────────
    public function delete(int $id): bool {
        $this->pdo->prepare("DELETE FROM blog_comments WHERE post_id = :id")
                  ->execute([':id' => $id]);
        $stmt = $this->pdo->prepare("DELETE FROM blog_posts WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }

    // ── POST : ajouter un commentaire ─────────────────────────────────────────
    public function addComment(array $data): bool {
        $stmt = $this->pdo->prepare("
            INSERT INTO blog_comments (post_id, author_name, author_email, content, created_at)
            VALUES (:pid, :name, :email, :content, NOW())
        ");
        return $stmt->execute([
            ':pid'     => (int)$data['post_id'],
            ':name'    => $data['author_name'],
            ':email'   => $data['author_email'] ?? '',
            ':content' => $data['content'],
        ]);
    }

    // ── Incrémenter les vues ──────────────────────────────────────────────────
    public function incrementViews(int $id): void {
        $this->pdo->prepare("UPDATE blog_posts SET views = views + 1 WHERE id = :id")
                  ->execute([':id' => $id]);
    }

    // ── Vérifier l'existence d'un article ────────────────────────────────────
    public function exists(int $id): bool {
        $stmt = $this->pdo->prepare("SELECT id FROM blog_posts WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return (bool)$stmt->fetch();
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLASSE : BlogController — logique de routage et réponses JSON
// ═══════════════════════════════════════════════════════════════════════════════
class BlogController {

    private BlogRepository $repo;

    public function __construct(BlogRepository $repo) {
        $this->repo = $repo;
    }

    // ── Réponse JSON ──────────────────────────────────────────────────────────
    private function json(array $data, int $status = 200): void {
        http_response_code($status);
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit();
    }

    // ── Lire le body JSON ─────────────────────────────────────────────────────
    private function getBody(): array {
        return json_decode(file_get_contents('php://input'), true) ?? [];
    }

    // ── GET : liste ───────────────────────────────────────────────────────────
    public function index(): void {
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
        $sort  = $_GET['sort'] ?? 'created_at';
        $this->json(['success' => true, 'data' => $this->repo->findAll($limit, $sort)]);
    }

    // ── GET : article unique (slug ou id) ─────────────────────────────────────
    public function show(string|int $slugOrId): void {
        $post = is_numeric($slugOrId)
            ? $this->repo->findById((int)$slugOrId)
            : $this->repo->findBySlug($slugOrId);

        if (!$post) {
            $this->json(['success' => false, 'message' => 'Article non trouvé'], 404);
        }

        $this->repo->incrementViews((int)$post['id']);
        $post['is_featured'] = (bool)$post['is_featured'];
        $post['comments']    = $this->repo->findComments((int)$post['id']);
        $post['similar']     = $this->repo->findSimilar($post['category'], (int)$post['id']);

        $this->json(['success' => true, 'data' => $post]);
    }

    // ── GET : articles en vedette ─────────────────────────────────────────────
    public function featured(): void {
        $this->json(['success' => true, 'data' => $this->repo->findFeatured()]);
    }

    // ── GET : catégories ──────────────────────────────────────────────────────
    public function categories(): void {
        $this->json(['success' => true, 'data' => $this->repo->findCategories()]);
    }

    // ── GET : recherche ───────────────────────────────────────────────────────
    public function search(): void {
        $q = $_GET['q'] ?? '';
        $this->json(['success' => true, 'data' => $this->repo->search($q)]);
    }

    // ── POST : créer ──────────────────────────────────────────────────────────
    public function store(): void {
        $data = $this->getBody();
        if (empty($data['title']) || empty($data['content'])) {
            $this->json(['success' => false, 'message' => 'Titre et contenu requis'], 400);
        }
        $result = $this->repo->create($data);
        $this->json([
            'success' => true,
            'message' => 'Article créé avec succès',
            'post_id' => $result['post_id'],
            'slug'    => $result['slug'],
        ]);
    }

    // ── PUT : modifier ────────────────────────────────────────────────────────
    public function update(int $id): void {
        if (!$this->repo->exists($id)) {
            $this->json(['success' => false, 'message' => 'Article non trouvé'], 404);
        }
        $data = $this->getBody();
        if (empty($data)) {
            $this->json(['success' => false, 'message' => 'Aucune donnée'], 400);
        }
        $this->repo->update($id, $data);
        $this->json(['success' => true, 'message' => 'Article mis à jour avec succès']);
    }

    // ── DELETE : supprimer ────────────────────────────────────────────────────
    public function destroy(int $id): void {
        if (!$this->repo->exists($id)) {
            $this->json(['success' => false, 'message' => 'Article non trouvé'], 404);
        }
        $this->repo->delete($id);
        $this->json(['success' => true, 'message' => 'Article supprimé avec succès']);
    }

    // ── POST : commentaire ────────────────────────────────────────────────────
    public function addComment(): void {
        $data = $this->getBody();
        if (empty($data['post_id']) || empty($data['author_name']) || empty($data['content'])) {
            $this->json(['success' => false, 'message' => 'Données manquantes'], 400);
        }
        $this->repo->addComment($data);
        $this->json(['success' => true, 'message' => 'Commentaire soumis avec succès']);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROUTEUR
// ═══════════════════════════════════════════════════════════════════════════════
try {
    $db         = new Database();
    $pdo        = $db->getConnection();
    $repository = new BlogRepository($pdo);
    $controller = new BlogController($repository);

    $method   = $_SERVER['REQUEST_METHOD'];
    $pathInfo = trim($_SERVER['PATH_INFO'] ?? '', '/');
    $parts    = $pathInfo ? explode('/', $pathInfo) : [];
    $action   = $_GET['action'] ?? $parts[0] ?? '';
    $id       = isset($_GET['id']) ? (int)$_GET['id']
              : (isset($parts[1]) ? (int)$parts[1] : null);

    // Slug dans PATH_INFO (non numérique)
    $slugFromPath = (!empty($parts[0]) && !is_numeric($parts[0])) ? $parts[0] : null;

    switch ($method) {
        case 'GET':
            if ($action === 'featured')  { $controller->featured();   break; }
            if ($action === 'categories'){ $controller->categories();  break; }
            if ($action === 'search' || isset($_GET['q'])) { $controller->search(); break; }
            if ($slugFromPath)           { $controller->show($slugFromPath); break; }
            if ($id)                     { $controller->show($id);     break; }
            $controller->index();
            break;

        case 'POST':
            if ($action === 'comment') { $controller->addComment(); break; }
            $controller->store();
            break;

        case 'PUT':
            if ($id) { $controller->update($id); break; }
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID requis']);
            break;

        case 'DELETE':
            if ($id) { $controller->destroy($id); break; }
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID requis']);
            break;

        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur serveur: ' . $e->getMessage()]);
}
?>