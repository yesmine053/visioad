<?php
// Backend/api/auth.php - Version avec système de permissions

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

ob_start();

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'login':
        login();
        break;
        
    case 'check':
        checkAuth();
        break;
        
    case 'register':
        register();
        break;
        
    case 'logout':
        logout();
        break;
        
    case 'permissions':
        getUserPermissions();
        break;
        
    default:
        echo json_encode([
            'success' => false,
            'message' => 'Action non supportée',
            'available_actions' => ['login', 'check', 'register', 'logout', 'permissions']
        ]);
        break;
}

ob_end_flush();

function login() {
    $db = new Database();
    $pdo = $db->getConnection();
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (empty($data['email']) || empty($data['password'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false, 
            'message' => 'Email et mot de passe requis'
        ]);
        return;
    }
    
    // REQUÊTE SIMPLIFIÉE
    $sql = "SELECT id, username, email, password, role, verified, avatar, bio, status
            FROM users 
            WHERE email = :email";
    
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':email', $data['email']);
    $stmt->execute();
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        http_response_code(401);
        echo json_encode([
            'success' => false, 
            'message' => 'Email ou mot de passe incorrect'
        ]);
        return;
    }
    
    // Vérifier le mot de passe
    if (!password_verify($data['password'], $user['password'])) {
        http_response_code(401);
        echo json_encode([
            'success' => false, 
            'message' => 'Mot de passe incorrect'
        ]);
        return;
    }
    
    // Vérifier si l'utilisateur est actif
    if ($user['status'] !== 'active') {
        http_response_code(403);
        echo json_encode([
            'success' => false, 
            'message' => 'Compte désactivé'
        ]);
        return;
    }
    
    // RÉCUPÉRER LES PERMISSIONS DEPUIS LA BASE DE DONNÉES
    $userPermissions = getUserPermissionsFromDB($pdo, $user['role']);
    
    // Générer le token JWT
    $jwt = new JWT();
    $tokenPayload = [
        'id' => $user['id'],
        'email' => $user['email'],
        'role' => $user['role'],
        'name' => $user['username'],
        'permissions' => $userPermissions, // Ajout des permissions dans le token
        'exp' => time() + (60 * 60 * 24 * 7) // 7 jours
    ];
    
    $access_token = $jwt->encode($tokenPayload);
    
    // Nettoyer les données sensibles
    unset($user['password']);
    
    // Mettre à jour la dernière connexion
    $updateSql = "UPDATE users SET last_login = NOW() WHERE id = :id";
    $updateStmt = $pdo->prepare($updateSql);
    $updateStmt->bindParam(':id', $user['id']);
    $updateStmt->execute();
    
    echo json_encode([
        'success' => true,
        'message' => 'Connexion réussie',
        'access_token' => $access_token,
        'expires_in' => 604800,
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'role' => $user['role'],
            'avatar' => $user['avatar'],
            'verified' => (bool)$user['verified']
        ],
        'permissions' => $userPermissions // Permissions retournées séparément aussi
    ]);
}

function checkAuth() {
    $db = new Database();
    $pdo = $db->getConnection();
    
    $headers = getallheaders();
    $token = null;
    
    // 1. Récupérer depuis Authorization header
    if (isset($headers['Authorization'])) {
        $authHeader = $headers['Authorization'];
        if (strpos($authHeader, 'Bearer ') === 0) {
            $token = substr($authHeader, 7);
        }
    }
    
    // 2. Depuis GET parameter (fallback)
    if (!$token && isset($_GET['token'])) {
        $token = $_GET['token'];
    }
    
    if (empty($token)) {
        echo json_encode([
            'success' => false,
            'message' => 'Token manquant',
            'authenticated' => false
        ]);
        return;
    }
    
    try {
        // Valider le token JWT
        $jwt = new JWT();
        $decoded = $jwt->decode($token);
        
        if (!$decoded) {
            throw new Exception('Token invalide');
        }
        
        // Vérifier si l'utilisateur existe encore
        $sql = "SELECT id, username, email, role, verified, avatar, status 
                FROM users 
                WHERE id = :id";
        
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':id', $decoded['id'], PDO::PARAM_INT);
        $stmt->execute();
        
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            echo json_encode([
                'success' => false,
                'message' => 'Utilisateur non trouvé',
                'authenticated' => false
            ]);
            return;
        }
        
        // Récupérer les permissions actuelles
        $permissions = getUserPermissionsFromDB($pdo, $user['role']);
        
        echo json_encode([
            'success' => true,
            'authenticated' => true,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'role' => $user['role'],
                'avatar' => $user['avatar'],
                'verified' => (bool)$user['verified']
            ],
            'permissions' => $permissions,
            'token_valid' => true,
            'role' => $user['role']
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage(),
            'authenticated' => false,
            'token_expired' => true
        ]);
    }
}

function register() {
    $db = new Database();
    $pdo = $db->getConnection();
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $required = ['username', 'email', 'password', 'role'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            http_response_code(400);
            echo json_encode([
                'success' => false, 
                'message' => "Champ $field manquant"
            ]);
            return;
        }
    }
    
    // Valider le rôle
    if (!in_array($data['role'], ['client', 'visitor'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false, 
            'message' => 'Rôle non valide'
        ]);
        return;
    }
    
    // Vérifier si l'email existe déjà
    $check_sql = "SELECT id FROM users WHERE email = :email";
    $check_stmt = $pdo->prepare($check_sql);
    $check_stmt->bindParam(':email', $data['email']);
    $check_stmt->execute();
    
    if ($check_stmt->fetch()) {
        http_response_code(409);
        echo json_encode([
            'success' => false, 
            'message' => 'Cet email est déjà utilisé'
        ]);
        return;
    }
    
    // Hasher le mot de passe
    $hashed_password = password_hash($data['password'], PASSWORD_DEFAULT);
    
    // Insérer l'utilisateur
    $sql = "INSERT INTO users 
            (username, email, password, role, verified, created_at) 
            VALUES 
            (:username, :email, :password, :role, FALSE, NOW())";
    
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':username', $data['username']);
    $stmt->bindParam(':email', $data['email']);
    $stmt->bindParam(':password', $hashed_password);
    $stmt->bindParam(':role', $data['role']);
    
    try {
        if ($stmt->execute()) {
            $user_id = $pdo->lastInsertId();
            
            // Récupérer les permissions pour ce rôle
            $permissions = getUserPermissionsFromDB($pdo, $data['role']);
            
            // Générer le token JWT pour connexion automatique
            $jwt = new JWT();
            $tokenPayload = [
                'id' => $user_id,
                'email' => $data['email'],
                'role' => $data['role'],
                'name' => $data['username'],
                'permissions' => $permissions,
                'exp' => time() + (60 * 60 * 24 * 7)
            ];
            
            $access_token = $jwt->encode($tokenPayload);
            
            echo json_encode([
                'success' => true,
                'message' => 'Compte créé avec succès',
                'access_token' => $access_token,
                'user' => [
                    'id' => $user_id,
                    'username' => $data['username'],
                    'email' => $data['email'],
                    'role' => $data['role'],
                    'verified' => false
                ],
                'permissions' => $permissions
            ]);
        } else {
            throw new Exception('Erreur lors de la création du compte');
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false, 
            'message' => 'Erreur serveur: ' . $e->getMessage()
        ]);
    }
}

function logout() {
    echo json_encode([
        'success' => true,
        'message' => 'Déconnexion réussie'
    ]);
}

function getUserPermissions() {
    $db = new Database();
    $pdo = $db->getConnection();
    
    $headers = getallheaders();
    $token = null;
    
    if (isset($headers['Authorization'])) {
        $authHeader = $headers['Authorization'];
        if (strpos($authHeader, 'Bearer ') === 0) {
            $token = substr($authHeader, 7);
        }
    }
    
    if (empty($token)) {
        echo json_encode([
            'success' => false,
            'message' => 'Token manquant'
        ]);
        return;
    }
    
    try {
        $jwt = new JWT();
        $decoded = $jwt->decode($token);
        
        if (!$decoded) {
            throw new Exception('Token invalide');
        }
        
        // Récupérer les permissions depuis la BD
        $permissions = getUserPermissionsFromDB($pdo, $decoded['role']);
        
        echo json_encode([
            'success' => true,
            'permissions' => $permissions,
            'role' => $decoded['role']
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

// FONCTION UTILITAIRE : Récupérer les permissions depuis la BD
function getUserPermissionsFromDB($pdo, $role) {
    $sql = "SELECT p.name 
            FROM role_permissions rp
            JOIN permissions p ON rp.permission_id = p.id
            WHERE rp.role = :role";
    
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':role', $role);
    $stmt->execute();
    
    $permissions = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $permissions[] = $row['name'];
    }
    
    return $permissions;
}
?>