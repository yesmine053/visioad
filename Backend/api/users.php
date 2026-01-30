<?php
// Backend/api/users.php - Gestion des utilisateurs

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
    
    if (!$decoded || $decoded['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Accès refusé']);
        exit();
    }
    
    $db = new Database();
    $pdo = $db->getConnection();
    
    $method = $_SERVER['REQUEST_METHOD'];
    $action = $_GET['action'] ?? '';
    $userId = $_GET['id'] ?? null;
    
    switch ($method) {
        case 'GET':
            if ($userId) {
                getUser($pdo, $userId);
            } else if ($action === 'stats') {
                getUsersStats($pdo);
            } else {
                getUsers($pdo);
            }
            break;
            
        case 'POST':
            if ($action === 'create') {
                createUser($pdo);
            } else if ($action === 'update') {
                updateUser($pdo, $userId);
            }
            break;
            
        case 'PUT':
            updateUser($pdo, $userId);
            break;
            
        case 'DELETE':
            deleteUser($pdo, $userId);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

function getUsers($pdo) {
    $page = $_GET['page'] ?? 1;
    $limit = $_GET['limit'] ?? 10;
    $search = $_GET['search'] ?? '';
    $role = $_GET['role'] ?? '';
    $offset = ($page - 1) * $limit;
    
    $where = [];
    $params = [];
    
    if ($search) {
        $where[] = "(username LIKE :search OR email LIKE :search)";
        $params[':search'] = "%$search%";
    }
    
    if ($role) {
        $where[] = "role = :role";
        $params[':role'] = $role;
    }
    
    $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';
    
    // Compter total
    $countSql = "SELECT COUNT(*) as total FROM users $whereClause";
    $countStmt = $pdo->prepare($countSql);
    $countStmt->execute($params);
    $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Récupérer utilisateurs
    $sql = "SELECT id, username, email, role, avatar, bio, status, verified, 
                   last_login, created_at, updated_at, company, phone, 
                   subscription_type, subscription_end
            FROM users 
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
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Sécuriser les données
    foreach ($users as &$user) {
        unset($user['password']);
        $user['verified'] = (bool)$user['verified'];
    }
    
    echo json_encode([
        'success' => true,
        'users' => $users,
        'pagination' => [
            'page' => (int)$page,
            'limit' => (int)$limit,
            'total' => (int)$total,
            'pages' => ceil($total / $limit)
        ]
    ]);
}

function getUser($pdo, $userId) {
    $sql = "SELECT id, username, email, role, avatar, bio, status, verified, 
                   last_login, created_at, updated_at, company, phone, address,
                   subscription_type, subscription_end
            FROM users 
            WHERE id = :id";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':id' => $userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Utilisateur non trouvé']);
        return;
    }
    
    unset($user['password']);
    $user['verified'] = (bool)$user['verified'];
    
    echo json_encode([
        'success' => true,
        'user' => $user
    ]);
}

function createUser($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $required = ['username', 'email', 'password', 'role'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => "Champ $field manquant"]);
            return;
        }
    }
    
    // Vérifier email unique
    $checkStmt = $pdo->prepare("SELECT id FROM users WHERE email = :email");
    $checkStmt->execute([':email' => $data['email']]);
    if ($checkStmt->fetch()) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'Email déjà utilisé']);
        return;
    }
    
    // Hasher mot de passe
    $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
    
    $sql = "INSERT INTO users 
            (username, email, password, role, avatar, bio, status, verified, 
             company, phone, address, subscription_type, subscription_end, created_at)
            VALUES 
            (:username, :email, :password, :role, :avatar, :bio, :status, :verified,
             :company, :phone, :address, :subscription_type, :subscription_end, NOW())";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':username' => $data['username'],
        ':email' => $data['email'],
        ':password' => $hashedPassword,
        ':role' => $data['role'],
        ':avatar' => $data['avatar'] ?? null,
        ':bio' => $data['bio'] ?? null,
        ':status' => $data['status'] ?? 'active',
        ':verified' => $data['verified'] ?? 0,
        ':company' => $data['company'] ?? null,
        ':phone' => $data['phone'] ?? null,
        ':address' => $data['address'] ?? null,
        ':subscription_type' => $data['subscription_type'] ?? 'free',
        ':subscription_end' => $data['subscription_end'] ?? null
    ]);
    
    $userId = $pdo->lastInsertId();
    
    // Récupérer l'utilisateur créé
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = :id");
    $stmt->execute([':id' => $userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    unset($user['password']);
    $user['verified'] = (bool)$user['verified'];
    
    echo json_encode([
        'success' => true,
        'message' => 'Utilisateur créé avec succès',
        'user' => $user
    ]);
}

function updateUser($pdo, $userId) {
    if (!$userId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID utilisateur requis']);
        return;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Vérifier si l'utilisateur existe
    $checkStmt = $pdo->prepare("SELECT id FROM users WHERE id = :id");
    $checkStmt->execute([':id' => $userId]);
    if (!$checkStmt->fetch()) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Utilisateur non trouvé']);
        return;
    }
    
    // Construire la requête dynamiquement
    $fields = [];
    $params = [':id' => $userId];
    
    if (isset($data['username'])) {
        $fields[] = "username = :username";
        $params[':username'] = $data['username'];
    }
    
    if (isset($data['email'])) {
        // Vérifier email unique (sauf pour l'utilisateur actuel)
        $checkEmail = $pdo->prepare("SELECT id FROM users WHERE email = :email AND id != :id");
        $checkEmail->execute([':email' => $data['email'], ':id' => $userId]);
        if ($checkEmail->fetch()) {
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'Email déjà utilisé']);
            return;
        }
        $fields[] = "email = :email";
        $params[':email'] = $data['email'];
    }
    
    if (isset($data['password']) && !empty($data['password'])) {
        $fields[] = "password = :password";
        $params[':password'] = password_hash($data['password'], PASSWORD_DEFAULT);
    }
    
    if (isset($data['role'])) {
        $fields[] = "role = :role";
        $params[':role'] = $data['role'];
    }
    
    if (isset($data['avatar'])) {
        $fields[] = "avatar = :avatar";
        $params[':avatar'] = $data['avatar'];
    }
    
    if (isset($data['bio'])) {
        $fields[] = "bio = :bio";
        $params[':bio'] = $data['bio'];
    }
    
    if (isset($data['status'])) {
        $fields[] = "status = :status";
        $params[':status'] = $data['status'];
    }
    
    if (isset($data['verified'])) {
        $fields[] = "verified = :verified";
        $params[':verified'] = (bool)$data['verified'] ? 1 : 0;
    }
    
    if (isset($data['company'])) {
        $fields[] = "company = :company";
        $params[':company'] = $data['company'];
    }
    
    if (isset($data['phone'])) {
        $fields[] = "phone = :phone";
        $params[':phone'] = $data['phone'];
    }
    
    if (isset($data['address'])) {
        $fields[] = "address = :address";
        $params[':address'] = $data['address'];
    }
    
    if (isset($data['subscription_type'])) {
        $fields[] = "subscription_type = :subscription_type";
        $params[':subscription_type'] = $data['subscription_type'];
    }
    
    if (isset($data['subscription_end'])) {
        $fields[] = "subscription_end = :subscription_end";
        $params[':subscription_end'] = $data['subscription_end'];
    }
    
    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Aucune donnée à mettre à jour']);
        return;
    }
    
    $fields[] = "updated_at = NOW()";
    
    $sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    // Récupérer l'utilisateur mis à jour
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = :id");
    $stmt->execute([':id' => $userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    unset($user['password']);
    $user['verified'] = (bool)$user['verified'];
    
    echo json_encode([
        'success' => true,
        'message' => 'Utilisateur mis à jour avec succès',
        'user' => $user
    ]);
}

function deleteUser($pdo, $userId) {
    if (!$userId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID utilisateur requis']);
        return;
    }
    
    // Ne pas permettre la suppression de soi-même
    $jwt = new JWT();
    $decoded = $jwt->decode($_SERVER['HTTP_AUTHORIZATION'] ?? '');
    
    if ($decoded && $decoded['id'] == $userId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Vous ne pouvez pas supprimer votre propre compte']);
        return;
    }
    
    // Vérifier si l'utilisateur existe
    $checkStmt = $pdo->prepare("SELECT username FROM users WHERE id = :id");
    $checkStmt->execute([':id' => $userId]);
    $user = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Utilisateur non trouvé']);
        return;
    }
    
    // Supprimer l'utilisateur
    $stmt = $pdo->prepare("DELETE FROM users WHERE id = :id");
    $stmt->execute([':id' => $userId]);
    
    echo json_encode([
        'success' => true,
        'message' => "Utilisateur {$user['username']} supprimé avec succès"
    ]);
}

function getUsersStats($pdo) {
    // Statistiques utilisateurs
    $stats = [];
    
    // Total par rôle
    $stmt = $pdo->query("
        SELECT role, COUNT(*) as count 
        FROM users 
        GROUP BY role
    ");
    
    $byRole = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $byRole[] = [
            'role' => $row['role'],
            'count' => (int)$row['count']
        ];
    }
    
    // Inscriptions par mois
    $stmt = $pdo->query("
        SELECT 
            DATE_FORMAT(created_at, '%Y-%m') as month,
            COUNT(*) as count
        FROM users
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
    
    // Statut des comptes
    $stmt = $pdo->query("
        SELECT status, COUNT(*) as count 
        FROM users 
        GROUP BY status
    ");
    
    $byStatus = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $byStatus[] = [
            'status' => $row['status'],
            'count' => (int)$row['count']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'stats' => [
            'byRole' => $byRole,
            'byMonth' => $byMonth,
            'byStatus' => $byStatus
        ]
    ]);
}
?>