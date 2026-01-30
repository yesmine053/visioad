<?php
// contact_final.php - Version simplifiée et corrigée

// Activer l'affichage des erreurs pour le débogage
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Configuration CORS
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Gérer les requêtes OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Inclure PHPMailer
require_once 'PHPMailer/src/Exception.php';
require_once 'PHPMailer/src/PHPMailer.php';
require_once 'PHPMailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Vérifier la méthode
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    exit();
}

// Récupérer les données
$data = json_decode(file_get_contents('php://input'), true);

// Valider les données
if (empty($data)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Données manquantes']);
    exit();
}

$name = trim($data['name'] ?? '');
$email = trim($data['email'] ?? '');
$subject = trim($data['subject'] ?? 'Sans sujet');
$phone = trim($data['phone'] ?? '');
$message = trim($data['message'] ?? '');

// Validation simple
if (empty($name) || empty($email) || empty($message)) {
    echo json_encode([
        'success' => false,
        'message' => 'Nom, email et message sont obligatoires'
    ]);
    exit();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        'success' => false,
        'message' => 'Email invalide'
    ]);
    exit();
}

try {
    // 1. Créer l'instance PHPMailer
    $mail = new PHPMailer(true);
    
    // 2. Configurer SMTP
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'yesminebkr24@gmail.com';
    $mail->Password = 'fopp uvdu hoyl udul'; // Mot de passe d'application
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;
    
    // 3. Configurer les options
    $mail->CharSet = 'UTF-8';
    $mail->SMTPDebug = 0; // 0 pour production, 2 pour débogage
    $mail->Debugoutput = 'error_log';
    
    // 4. Définir les adresses
    $mail->setFrom('yesminebkr24@gmail.com', 'Site Web VisioAD');
    $mail->addAddress('yesminebkr24@gmail.com', 'Administrateur VisioAD');
    $mail->addReplyTo($email, $name);
    
    // 5. Créer le contenu HTML
    $mail->isHTML(true);
    $mail->Subject = "Nouveau message: " . $subject;
    
    $htmlContent = "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <style>
            body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
            .container { max-width: 600px; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .header { background: #d12127; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; }
            .field { margin-bottom: 15px; padding: 10px; background: #f9f9f9; border-radius: 5px; }
            .label { font-weight: bold; color: #d12127; margin-bottom: 5px; display: block; }
            .value { color: #333; }
            .footer { background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h2>📨 Nouveau message depuis VisioAD</h2>
            </div>
            <div class='content'>
                <div class='field'>
                    <span class='label'>👤 Nom :</span>
                    <span class='value'>$name</span>
                </div>
                <div class='field'>
                    <span class='label'>📧 Email :</span>
                    <span class='value'>$email</span>
                </div>
                <div class='field'>
                    <span class='label'>📞 Téléphone :</span>
                    <span class='value'>" . ($phone ?: 'Non fourni') . "</span>
                </div>
                <div class='field'>
                    <span class='label'>📋 Sujet :</span>
                    <span class='value'>$subject</span>
                </div>
                <div class='field'>
                    <span class='label'>💬 Message :</span>
                    <div class='value' style='margin-top: 10px; padding: 10px; background: white; border: 1px solid #ddd; border-radius: 3px;'>$message</div>
                </div>
                <div class='field'>
                    <span class='label'>🕐 Date :</span>
                    <span class='value'>" . date('d/m/Y H:i:s') . "</span>
                </div>
            </div>
            <div class='footer'>
                Message envoyé depuis le formulaire de contact de <a href='https://visioad.vercel.app'>visioad.vercel.app</a>
            </div>
        </div>
    </body>
    </html>";
    
    $mail->Body = $htmlContent;
    $mail->AltBody = "Nouveau message depuis VisioAD\n\n" .
                    "Nom: $name\n" .
                    "Email: $email\n" .
                    "Téléphone: $phone\n" .
                    "Sujet: $subject\n" .
                    "Message: $message\n" .
                    "Date: " . date('d/m/Y H:i:s');
    
    // 6. Envoyer l'email
    if ($mail->send()) {
        // Optionnel: enregistrer dans un fichier log
        $logEntry = date('Y-m-d H:i:s') . " | $name | $email | $subject" . PHP_EOL;
        file_put_contents('email_log.txt', $logEntry, FILE_APPEND);
        
        echo json_encode([
            'success' => true,
            'message' => '✅ Message envoyé avec succès ! Nous vous répondrons rapidement.'
        ]);
    } else {
        throw new Exception('Échec de l\'envoi');
    }
    
} catch (Exception $e) {
    // Enregistrer l'erreur
    $errorLog = date('Y-m-d H:i:s') . " | Erreur: " . $e->getMessage() . PHP_EOL;
    file_put_contents('error_log.txt', $errorLog, FILE_APPEND);
    
    echo json_encode([
        'success' => false,
        'message' => '❌ Erreur d\'envoi. Veuillez nous contacter directement.',
        'error' => $mail->ErrorInfo ?? $e->getMessage() // Pour débogage
    ]);
}
?>