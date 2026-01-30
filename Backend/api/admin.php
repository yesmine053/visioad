// Backend/api/admin.php
<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/JWT.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Authorization, Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$action = $_GET['action'] ?? '';

// Vérifier le token JWT
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? '';
$token = str_replace('Bearer ', '', $authHeader);

try {
    $decoded = JWT::verify($token);
    
    // Vérifier si l'utilisateur est admin
    if ($decoded->role !== 'admin') {
        throw new Exception('Accès non autorisé');
    }
    
    $db = Database::getConnection();
    
    switch ($action) {
        case 'stats':
            // Récupérer les statistiques
            $stats = [];
            
            // Total utilisateurs
            $stmt = $db->prepare("SELECT COUNT(*) as count FROM users");
            $stmt->execute();
            $stats['totalUsers'] = $stmt->fetch()['count'];
            
            // Utilisateurs ce mois-ci
            $stmt = $db->prepare("SELECT COUNT(*) as count FROM users WHERE MONTH(created_at) = MONTH(CURRENT_DATE())");
            $stmt->execute();
            $stats['newUsersThisMonth'] = $stmt->fetch()['count'];
            
            // Projets actifs (vous devez adapter selon votre structure)
            $stats['activeProjects'] = rand(10, 100); // Exemple
            
            // Revenu total (à adapter)
            $stats['totalRevenue'] = rand(10000, 500000);
            
            // Tâches en attente
            $stats['pendingTasks'] = rand(1, 50);
            
            // Messages non lus
            $stmt = $db->prepare("SELECT COUNT(*) as count FROM messages WHERE read_at IS NULL");
            $stmt->execute();
            $stats['newMessages'] = $stmt->fetch()['count'];
            
            // Croissance
            $stats['monthlyGrowth'] = rand(5, 30);
            
            echo json_encode(['success' => true, 'stats' => $stats]);
            break;
            
        case 'recent-users':
            // Derniers utilisateurs inscrits
            $stmt = $db->prepare("
                SELECT id, email, role, created_at as joinDate 
                FROM users 
                ORDER BY created_at DESC 
                LIMIT 10
            ");
            $stmt->execute();
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Ajouter des noms fictifs (vous devriez avoir un champ 'name' dans votre table)
            foreach ($users as &$user) {
                $user['name'] = 'Utilisateur #' . $user['id'];
                $user['email'] = $user['email'] ?? 'utilisateur' . $user['id'] . '@example.com';
            }
            
            echo json_encode(['success' => true, 'users' => $users]);
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Action non valide']);
    }
    
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>