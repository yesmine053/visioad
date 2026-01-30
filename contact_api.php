<?php
// contact_api.php - VERSION CORRIGÉE SANS ERREUR DE SYNTAXE
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Pour accepter les requêtes depuis React/Next.js
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // 1. Récupérer les données
        $raw_input = file_get_contents('php://input');
        
        // 2. Essayer de décoder JSON
        $data = json_decode($raw_input, true);
        
        // 3. Si échec, essayer de nettoyer
        if (json_last_error() !== JSON_ERROR_NONE) {
            // Nettoyer pour PowerShell
            $cleaned = str_replace(["\r", "\n", "\t"], '', $raw_input);
            $cleaned = preg_replace('/\s+/', ' ', $cleaned);
            $data = json_decode($cleaned, true);
        }
        
        // 4. Si toujours échec, utiliser $_POST
        if (json_last_error() !== JSON_ERROR_NONE && !empty($_POST)) {
            $data = $_POST;
        }
        
        // 5. Validation
        if (empty($data) || !is_array($data)) {
            throw new Exception('Aucune donnée valide reçue');
        }
        
        $required = ['name', 'email', 'message'];
        foreach ($required as $field) {
            if (empty(trim($data[$field] ?? ''))) {
                throw new Exception("Le champ '$field' est requis");
            }
        }
        
        // 6. Validation email
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            throw new Exception('Adresse email invalide');
        }
        
        // 7. Connexion DB
        $pdo = new PDO('mysql:host=localhost;dbname=visioad_db;charset=utf8', 'root', '');
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        // 8. Insertion
        $stmt = $pdo->prepare("
            INSERT INTO contacts 
            (name, email, phone, subject, message, status, created_at) 
            VALUES 
            (:name, :email, :phone, :subject, :message, 'new', NOW())
        ");
        
        $stmt->execute([
            ':name' => htmlspecialchars(trim($data['name'])),
            ':email' => htmlspecialchars(trim($data['email'])),
            ':phone' => htmlspecialchars(trim($data['phone'] ?? '')),
            ':subject' => htmlspecialchars(trim($data['subject'] ?? '')),
            ':message' => htmlspecialchars(trim($data['message']))
        ]);
        
        $contact_id = $pdo->lastInsertId();
        
        // 9. Envoyer email (optionnel - à configurer plus tard)
        sendEmailNotification($data, $contact_id);
        
        // 10. Réponse succès
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Message envoyé avec succès ! Nous vous contacterons dans les 24h.',
            'contact_id' => $contact_id
        ]);
        
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
} else {
    // CORRECTION : Utiliser des guillemets doubles échappés pour l'exemple PowerShell
    echo json_encode([
        'api' => 'VisioAD Contact API',
        'version' => '1.0',
        'status' => 'active',
        'endpoint' => '/contact_api.php',
        'method' => 'POST',
        'required_fields' => ['name', 'email', 'message'],
        'optional_fields' => ['phone', 'subject'],
        'example' => [
            'json' => '{"name":"John","email":"john@example.com","message":"Hello"}',
            'powershell' => '$body = "{\"name\":\"Test\",\"email\":\"test@test.com\",\"message\":\"Test\"}"',
            'curl' => 'curl -X POST "http://localhost/Visioad/contact_api.php" -H "Content-Type: application/json" -d "{\"name\":\"Test\",\"email\":\"test@test.com\",\"message\":\"Test"}"'
        ]
    ]);
}

function sendEmailNotification($data, $contact_id) {
    // À implémenter avec PHPMailer ou service d'email
    // Pour l'instant, juste un log
    $log = date('Y-m-d H:i:s') . " | Contact ID: $contact_id | From: {$data['email']}\n";
    file_put_contents('email_notifications.log', $log, FILE_APPEND);
    
    // Vous pouvez ajouter PHPMailer ici plus tard
    return true;
}
?>