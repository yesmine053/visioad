<?php
// backend/api/media.php

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/JWT.php';

// Vérifier l'authentification
$token = getBearerToken();
if (!$token) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Non autorisé']);
    exit();
}

try {
    $payload = JWT::decode($token);
    
    // Vérifier les permissions (seuls les admin/editor peuvent uploader)
    if (!in_array($payload['role'], ['admin', 'editor'])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Permissions insuffisantes']);
        exit();
    }
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Token invalide']);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch($method) {
        case 'POST':
            uploadMedia();
            break;
            
        case 'GET':
            getMediaList();
            break;
            
        case 'DELETE':
            deleteMedia();
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

function uploadMedia() {
    global $pdo;
    
    if (!isset($_FILES['file'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Aucun fichier reçu']);
        return;
    }
    
    $file = $_FILES['file'];
    
    // Validation
    $allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    $max_size = 10 * 1024 * 1024; // 10MB
    
    if (!in_array($file['type'], $allowed_types)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Type de fichier non autorisé']);
        return;
    }
    
    if ($file['size'] > $max_size) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Fichier trop volumineux (max 10MB)']);
        return;
    }
    
    // Générer un nom de fichier unique
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid() . '_' . time() . '.' . $extension;
    
    // Dossier de destination
    $upload_dir = __DIR__ . '/../../uploads/';
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }
    
    $destination = $upload_dir . $filename;
    
    // Déplacer le fichier
    if (move_uploaded_file($file['tmp_name'], $destination)) {
        // Enregistrer dans la base de données
        $sql = "INSERT INTO media (filename, original_name, mime_type, size, path, uploaded_by, created_at) 
                VALUES (:filename, :original_name, :mime_type, :size, :path, :uploaded_by, NOW())";
        
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':filename', $filename);
        $stmt->bindParam(':original_name', $file['name']);
        $stmt->bindParam(':mime_type', $file['type']);
        $stmt->bindParam(':size', $file['size'], PDO::PARAM_INT);
        $stmt->bindParam(':path', $filename); // Stocker seulement le nom du fichier
        $stmt->bindParam(':uploaded_by', $_SERVER['PHP_AUTH_USER'] ?? 'system');
        
        if ($stmt->execute()) {
            $media_id = $pdo->lastInsertId();
            
            echo json_encode([
                'success' => true,
                'message' => 'Fichier uploadé avec succès',
                'media' => [
                    'id' => $media_id,
                    'filename' => $filename,
                    'original_name' => $file['name'],
                    'url' => '/uploads/' . $filename,
                    'size' => formatBytes($file['size']),
                    'type' => $file['type']
                ]
            ]);
        } else {
            unlink($destination); // Supprimer le fichier si l'insertion échoue
            throw new Exception('Erreur lors de l\'enregistrement en base de données');
        }
    } else {
        throw new Exception('Erreur lors du déplacement du fichier');
    }
}

function getMediaList() {
    global $pdo;
    
    $page = $_GET['page'] ?? 1;
    $limit = $_GET['limit'] ?? 20;
    $search = $_GET['search'] ?? '';
    $type = $_GET['type'] ?? '';
    $offset = ($page - 1) * $limit;
    
    $sql = "SELECT id, filename, original_name, mime_type, size, path, 
                   uploaded_by, created_at,
                   DATE_FORMAT(created_at, '%d/%m/%Y %H:%i') as date_display
            FROM media 
            WHERE 1=1";
    
    $params = [];
    
    if ($search) {
        $sql .= " AND (original_name LIKE :search OR filename LIKE :search)";
        $params[':search'] = "%$search%";
    }
    
    if ($type) {
        $sql .= " AND mime_type LIKE :type";
        $params[':type'] = "$type%";
    }
    
    $sql .= " ORDER BY created_at DESC LIMIT :limit OFFSET :offset";
    
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
    
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    
    $stmt->execute();
    $media = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Formater les URLs et tailles
    foreach ($media as &$item) {
        $item['url'] = '/uploads/' . $item['path'];
        $item['size_display'] = formatBytes($item['size']);
        $item['type_icon'] = getFileTypeIcon($item['mime_type']);
    }
    
    // Compter le total
    $count_sql = "SELECT COUNT(*) as total FROM media WHERE 1=1";
    $count_params = [];
    
    if ($search) {
        $count_sql .= " AND (original_name LIKE :search OR filename LIKE :search)";
        $count_params[':search'] = "%$search%";
    }
    
    if ($type) {
        $count_sql .= " AND mime_type LIKE :type";
        $count_params[':type'] = "$type%";
    }
    
    $count_stmt = $pdo->prepare($count_sql);
    foreach ($count_params as $key => $value) {
        $count_stmt->bindValue($key, $value);
    }
    $count_stmt->execute();
    $total = $count_stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    echo json_encode([
        'success' => true,
        'data' => $media,
        'pagination' => [
            'page' => (int)$page,
            'limit' => (int)$limit,
            'total' => (int)$total,
            'pages' => ceil($total / $limit)
        ]
    ]);
}

function deleteMedia() {
    global $pdo;
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (empty($data['id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID du média requis']);
        return;
    }
    
    // Récupérer les infos du média
    $sql = "SELECT path FROM media WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':id', $data['id'], PDO::PARAM_INT);
    $stmt->execute();
    
    $media = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$media) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Média non trouvé']);
        return;
    }
    
    // Supprimer le fichier physique
    $file_path = __DIR__ . '/../../uploads/' . $media['path'];
    if (file_exists($file_path)) {
        unlink($file_path);
    }
    
    // Supprimer de la base de données
    $delete_sql = "DELETE FROM media WHERE id = :id";
    $delete_stmt = $pdo->prepare($delete_sql);
    $delete_stmt->bindParam(':id', $data['id'], PDO::PARAM_INT);
    
    if ($delete_stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Média supprimé avec succès'
        ]);
    } else {
        throw new Exception('Erreur lors de la suppression');
    }
}

// Fonctions utilitaires
function getBearerToken() {
    $headers = getallheaders();
    if (isset($headers['Authorization'])) {
        if (preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
            return $matches[1];
        }
    }
    return null;
}

function formatBytes($bytes, $precision = 2) {
    $units = ['B', 'KB', 'MB', 'GB', 'TB'];
    $bytes = max($bytes, 0);
    $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
    $pow = min($pow, count($units) - 1);
    $bytes /= pow(1024, $pow);
    
    return round($bytes, $precision) . ' ' . $units[$pow];
}

function getFileTypeIcon($mime_type) {
    $icons = [
        'image/jpeg' => '🖼️',
        'image/png' => '🖼️',
        'image/gif' => '🖼️',
        'image/webp' => '🖼️',
        'image/svg+xml' => '🎨',
        'application/pdf' => '📄',
        'application/msword' => '📝',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => '📝',
        'video/mp4' => '🎬',
        'audio/mpeg' => '🎵'
    ];
    
    return $icons[$mime_type] ?? '📎';
}
?>