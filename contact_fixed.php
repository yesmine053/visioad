<?php
// contact_fixed.php - VERSION CORRIGÉE
header("Content-Type: application/json; charset=UTF-8");

// Activer le débogage
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Log pour voir ce qui est reçu
$log_file = __DIR__ . '/api_log.txt';
file_put_contents($log_file, date('Y-m-d H:i:s') . " === NOUVELLE REQUÊTE ===\n", FILE_APPEND);
file_put_contents($log_file, "Méthode: " . $_SERVER['REQUEST_METHOD'] . "\n", FILE_APPEND);
file_put_contents($log_file, "Content-Type: " . ($_SERVER['CONTENT_TYPE'] ?? 'Non défini') . "\n", FILE_APPEND);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Récupérer les données RAW
        $raw_input = file_get_contents('php://input');
        file_put_contents($log_file, "Données brutes reçues: " . $raw_input . "\n", FILE_APPEND);
        
        // Initialiser $data
        $data = [];
        
        // Essayer JSON d'abord
        if (!empty($raw_input)) {
            $data = json_decode($raw_input, true);
            file_put_contents($log_file, "JSON décodé: " . print_r($data, true) . "\n", FILE_APPEND);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                file_put_contents($log_file, "Erreur JSON: " . json_last_error_msg() . "\n", FILE_APPEND);
                $data = []; // Réinitialiser si JSON invalide
            }
        }
        
        // Si pas de JSON valide, essayer $_POST (pour form-data)
        if (empty($data) && !empty($_POST)) {
            $data = $_POST;
            file_put_contents($log_file, "Utilisation de \$_POST: " . print_r($data, true) . "\n", FILE_APPEND);
        }
        
        // Si toujours vide, essayer de parser manuellement
        if (empty($data) && !empty($raw_input)) {
            // Essayer de parser comme query string (name=value&email=...)
            parse_str($raw_input, $data);
            file_put_contents($log_file, "Parsé comme query string: " . print_r($data, true) . "\n", FILE_APPEND);
        }
        
        file_put_contents($log_file, "Données finales: " . print_r($data, true) . "\n", FILE_APPEND);
        
        // Validation
        $errors = [];
        if (empty($data['name'])) $errors[] = 'Nom manquant';
        if (empty($data['email'])) $errors[] = 'Email manquant';
        if (empty($data['message'])) $errors[] = 'Message manquant';
        
        if (!empty($errors)) {
            file_put_contents($log_file, "Erreurs de validation: " . implode(', ', $errors) . "\n", FILE_APPEND);
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Erreurs: ' . implode(', ', $errors),
                'debug' => [
                    'raw_input' => $raw_input,
                    'data_received' => $data,
                    'post_data' => $_POST
                ]
            ]);
            exit;
        }
        
        // Connexion à la base de données
        $host = 'localhost';
        $dbname = 'visioad_db';
        $username = 'root';
        $password = '';
        
        $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        // Préparer la requête
        $stmt = $pdo->prepare("
            INSERT INTO contacts (name, email, phone, subject, message, status, created_at) 
            VALUES (:name, :email, :phone, :subject, :message, 'new', NOW())
        ");
        
        // Exécuter
        $stmt->execute([
            ':name' => htmlspecialchars($data['name']),
            ':email' => htmlspecialchars($data['email']),
            ':phone' => isset($data['phone']) ? htmlspecialchars($data['phone']) : '',
            ':subject' => isset($data['subject']) ? htmlspecialchars($data['subject']) : '',
            ':message' => htmlspecialchars($data['message'])
        ]);
        
        $id = $pdo->lastInsertId();
        file_put_contents($log_file, "✅ Contact créé avec ID: $id\n", FILE_APPEND);
        
        // Succès
        echo json_encode([
            'success' => true,
            'message' => 'Message envoyé avec succès! ID: ' . $id,
            'contact_id' => $id
        ]);
        
    } catch (Exception $e) {
        file_put_contents($log_file, "❌ Exception: " . $e->getMessage() . "\n", FILE_APPEND);
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Erreur serveur: ' . $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
    }
} else {
    // Pour les GET, retourner des informations
    echo json_encode([
        'api_name' => 'VisioAD Contact API',
        'version' => '1.0',
        'methods_allowed' => ['POST'],
        'test_command' => 'curl -X POST "http://localhost/Visioad/contact_fixed.php" -H "Content-Type: application/json" -d \'{"name":"Test","email":"test@test.com","message":"Test"}\''
    ]);
}

file_put_contents($log_file, "=== FIN REQUÊTE ===\n\n", FILE_APPEND);
?>