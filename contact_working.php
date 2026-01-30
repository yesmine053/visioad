<?php
// contact_working.php - Version FINALE et FONCTIONNELLE
header("Content-Type: application/json; charset=UTF-8");

// Pour React/Next.js
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // 1. Récupérer les données
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    // Si JSON échoue, essayer autre méthode
    if (json_last_error() !== JSON_ERROR_NONE) {
        if (!empty($_POST)) {
            $data = $_POST;
        } else {
            parse_str($input, $data);
        }
    }
    
    // 2. Validation SIMPLE
    if (empty($data['name']) || empty($data['email']) || empty($data['message'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Nom, email et message sont requis',
            'received' => $data
        ]);
        exit;
    }
    
    // Nettoyer les données
    $name = trim(htmlspecialchars($data['name']));
    $email = trim(htmlspecialchars($data['email']));
    $phone = !empty($data['phone']) ? trim(htmlspecialchars($data['phone'])) : '';
    $subject = !empty($data['subject']) ? trim(htmlspecialchars($data['subject'])) : '';
    $message = trim(htmlspecialchars($data['message']));
    
    // 3. Validation email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Email invalide'
        ]);
        exit;
    }
    
    try {
        // 4. Enregistrer en base de données
        $pdo = new PDO('mysql:host=localhost;dbname=visioad_db;charset=utf8', 'root', '');
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        $stmt = $pdo->prepare("
            INSERT INTO contacts 
            (name, email, phone, subject, message, status, created_at) 
            VALUES 
            (:name, :email, :phone, :subject, :message, 'new', NOW())
        ");
        
        $stmt->execute([
            ':name' => $name,
            ':email' => $email,
            ':phone' => $phone,
            ':subject' => $subject,
            ':message' => $message
        ]);
        
        $contact_id = $pdo->lastInsertId();
        
        // 5. Envoyer l'email avec Gmail SMTP
        $email_sent = sendGmail($name, $email, $phone, $subject, $message, $contact_id);
        
        // 6. Réponse SUCCÈS
        echo json_encode([
            'success' => true,
            'message' => $email_sent ? 
                '✅ Message envoyé avec succès ! Vous recevrez une réponse rapidement.' :
                '✅ Message enregistré ! (Email échoué en local)',
            'contact_id' => $contact_id,
            'email_sent' => $email_sent,
            'data' => [
                'name' => $name,
                'email' => $email
            ]
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Erreur serveur: ' . $e->getMessage()
        ]);
    }
    
} else {
    echo json_encode([
        'api' => 'VisioAD Contact API',
        'version' => '3.0',
        'status' => 'active',
        'method' => 'POST',
        'example_curl' => 'curl -X POST http://localhost/Visioad/contact_working.php -H "Content-Type: application/json" -d \'{"name":"Test","email":"test@test.com","message":"Hello"}\''
    ]);
}

// Fonction pour envoyer avec Gmail SMTP
function sendGmail($name, $email, $phone, $subject, $message, $contact_id) {
    try {
        // Configuration SMTP pour Gmail
        $smtp_host = 'smtp.gmail.com';
        $smtp_port = 587;
        $smtp_username = 'yesminebkr24@gmail.com';
        $smtp_password = 'foppuvduhoyludul'; // VOTRE MOT DE PASSE D'APPLICATION
        
        // Créer l'email
        $to = 'yesminebkr24@gmail.com';
        $email_subject = '📧 Nouveau contact VisioAD: ' . $name;
        
        // Contenu de l'email
        $email_body = "
        ===============================
        NOUVEAU CONTACT VISIOAD
        ===============================
        
        📋 ID: #$contact_id
        👤 Nom: $name
        📧 Email: $email
        📞 Téléphone: " . ($phone ?: 'Non fourni') . "
        📝 Sujet: " . ($subject ?: 'Non spécifié') . "
        
        💬 Message:
        $message
        
        ===============================
        📅 Date: " . date('d/m/Y H:i:s') . "
        🔗 Répondre à: $email
        ===============================
        ";
        
        // Headers
        $headers = [
            'From' => 'contact@visioad.com',
            'Reply-To' => $email,
            'X-Mailer' => 'PHP/' . phpversion(),
            'Content-Type' => 'text/plain; charset=utf-8'
        ];
        
        // Construire les headers
        $headers_str = '';
        foreach ($headers as $key => $value) {
            $headers_str .= "$key: $value\r\n";
        }
        
        // Essayer d'envoyer avec mail() (fonctionnera si SMTP configuré)
        $result = mail($to, $email_subject, $email_body, $headers_str);
        
        // Log
        file_put_contents('email_send.log', 
            date('Y-m-d H:i:s') . 
            " | ID: $contact_id | To: $to | From: $email | Result: " . 
            ($result ? 'SUCCESS' : 'FAILED') . "\n", 
            FILE_APPEND
        );
        
        return $result;
        
    } catch (Exception $e) {
        // Log l'erreur
        file_put_contents('email_errors.log', 
            date('Y-m-d H:i:s') . " | Error: " . $e->getMessage() . "\n", 
            FILE_APPEND
        );
        return false;
    }
}
?>