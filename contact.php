<?php
// contact.php - Version CORRIGÉE avec CORS complet

error_reporting(E_ALL);
ini_set('display_errors', 1);

// ========== HEADERS CORS COMPLETS ==========
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE, PUT");
header("Access-Control-Allow-Headers: Content-Type, Accept, Authorization, X-Requested-With, X-CSRF-Token");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");

// Gérer la requête OPTIONS (pré-vol CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
// ===========================================

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    exit();
}

// Log pour déboguer
file_put_contents('cors_debug.log', 
    date('Y-m-d H:i:s') . " - Headers reçus:\n" . 
    print_r(getallheaders(), true) . "\n" .
    "Method: " . $_SERVER['REQUEST_METHOD'] . "\n" .
    "Origin: " . ($_SERVER['HTTP_ORIGIN'] ?? 'none') . "\n\n", 
    FILE_APPEND
);

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Données invalides']);
    exit();
}

$name = $data['name'] ?? '';
$email = $data['email'] ?? '';
$subject = $data['subject'] ?? 'Nouveau message';
$phone = $data['phone'] ?? '';
$message = $data['message'] ?? '';

if (empty($name) || empty($email) || empty($message)) {
    echo json_encode(['success' => false, 'message' => 'Champs obligatoires manquants']);
    exit();
}

try {
    $mail = new PHPMailer(true);
    
    // Configuration Gmail qui fonctionne
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'yesminebkr24@gmail.com';
    $mail->Password = 'fopp uvdu hoyl udul';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;
    
    $mail->CharSet = 'UTF-8';
    
    // Destinataires
    $mail->setFrom('yesminebkr24@gmail.com', 'Site Web VisioAD');
    $mail->addAddress('yesminebkr24@gmail.com', 'Yesmine BKR');
    
    if (!empty($email)) {
        $mail->addReplyTo($email, $name);
    }
    
    // Contenu HTML
    $mail->isHTML(true);
    $mail->Subject = "📧 VisioAD - " . $subject;
    
    $mail->Body = "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <style>
            body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
            .container { max-width: 600px; background: white; border-radius: 10px; padding: 30px; }
            .header { color: #d12127; border-bottom: 2px solid #d12127; padding-bottom: 15px; }
            .field { margin: 15px 0; padding: 10px; background: #f9f9f9; border-radius: 5px; }
            .label { font-weight: bold; color: #333; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h2>✨ NOUVEAU MESSAGE VISIOAD ✨</h2>
            </div>
            
            <div class='field'>
                <div class='label'>👤 Nom :</div>
                <div>$name</div>
            </div>
            
            <div class='field'>
                <div class='label'>📧 Email :</div>
                <div>$email</div>
            </div>
            
            <div class='field'>
                <div class='label'>📞 Téléphone :</div>
                <div>" . ($phone ?: 'Non fourni') . "</div>
            </div>
            
            <div class='field'>
                <div class='label'>📋 Sujet :</div>
                <div>$subject</div>
            </div>
            
            <div class='field'>
                <div class='label'>💬 Message :</div>
                <div style='padding: 15px; background: white; border: 1px solid #ddd;'>$message</div>
            </div>
            
            <div style='margin-top: 20px; color: #666; font-size: 12px;'>
                Envoyé le " . date('d/m/Y H:i:s') . " depuis <a href='https://visioad.vercel.app'>visioad.vercel.app</a>
            </div>
        </div>
    </body>
    </html>";
    
    $mail->AltBody = "NOUVEAU MESSAGE VISIOAD\n\nNom: $name\nEmail: $email\nTéléphone: $phone\nSujet: $subject\n\nMessage:\n$message\n\nDate: " . date('d/m/Y H:i:s');
    
    if ($mail->send()) {
        // Log du succès
        file_put_contents('contact_log.txt', 
            date('Y-m-d H:i:s') . " | SUCCÈS | $name | $email | $subject\n", 
            FILE_APPEND
        );
        
        echo json_encode([
            'success' => true,
            'message' => '✅ Message envoyé avec succès ! Nous vous contacterons rapidement.'
        ]);
    } else {
        throw new Exception('Erreur d\'envoi');
    }
    
} catch (Exception $e) {
    file_put_contents('contact_errors.txt', 
        date('Y-m-d H:i:s') . " | ERREUR | " . $e->getMessage() . "\n", 
        FILE_APPEND
    );
    
    echo json_encode([
        'success' => false,
        'message' => '❌ Erreur d\'envoi. Veuillez réessayer.'
    ]);
}
?>