<?php
// contact_final_gmail.php - Version finale avec Gmail SMTP
header("Content-Type: application/json; charset=UTF-8");

// Inclure PHPMailer
require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Récupérer les données
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    // Si JSON invalide, essayer $_POST
    if (!$data && !empty($_POST)) {
        $data = $_POST;
    }
    
    // Validation
    $errors = [];
    if (empty($data['name'])) $errors[] = 'Nom manquant';
    if (empty($data['email'])) $errors[] = 'Email manquant';
    if (empty($data['message'])) $errors[] = 'Message manquant';
    
    if (!empty($errors)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Erreurs: ' . implode(', ', $errors)
        ]);
        exit;
    }
    
    // Validation email
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Adresse email invalide'
        ]);
        exit;
    }
    
    try {
        // 1. Connexion DB
        $pdo = new PDO('mysql:host=localhost;dbname=visioad_db;charset=utf8', 'root', '');
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        // 2. Insertion en base
        $stmt = $pdo->prepare("
            INSERT INTO contacts (name, email, phone, subject, message, status, created_at) 
            VALUES (:name, :email, :phone, :subject, :message, 'new', NOW())
        ");
        
        $stmt->execute([
            ':name' => htmlspecialchars($data['name']),
            ':email' => htmlspecialchars($data['email']),
            ':phone' => htmlspecialchars($data['phone'] ?? ''),
            ':subject' => htmlspecialchars($data['subject'] ?? ''),
            ':message' => htmlspecialchars($data['message'])
        ]);
        
        $contact_id = $pdo->lastInsertId();
        
        // 3. ENVOYER L'EMAIL AVEC GMAIL
        $email_result = sendEmailWithGmail($data, $contact_id);
        
        // 4. Réponse
        if ($email_result['success']) {
            echo json_encode([
                'success' => true,
                'message' => '✅ Message envoyé avec succès ! Vous recevrez une réponse rapidement.',
                'contact_id' => $contact_id,
                'email_sent' => true,
                'email_to' => 'yesminebkr24@gmail.com'
            ]);
        } else {
            // Même si l'email échoue, données sauvegardées
            echo json_encode([
                'success' => true,
                'message' => '📝 Message enregistré. (Problème email mais données sauvegardées)',
                'contact_id' => $contact_id,
                'email_sent' => false,
                'email_error' => $email_result['error']
            ]);
        }
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Erreur serveur: ' . $e->getMessage()
        ]);
    }
} else {
    // Pour GET
    echo json_encode([
        'api' => 'VisioAD Contact API avec Gmail',
        'version' => '2.0',
        'status' => 'active',
        'notification_email' => 'yesminebkr24@gmail.com',
        'method' => 'POST avec JSON',
        'test' => 'Utilisez PowerShell ou votre formulaire React'
    ]);
}

// FONCTION GMAIL
function sendEmailWithGmail($data, $contact_id) {
    $mail = new PHPMailer(true);
    
    try {
        // Configuration GMAIL
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'yesminebkr24@gmail.com';  // VOTRE GMAIL
        $mail->Password   = 'sxqsbbcopwfzgyrl';        // VOTRE MOT DE PASSE D'APPLICATION
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;
        
        // IMPORTANT: Désactiver la vérification SSL pour localhost
        $mail->SMTPOptions = array(
            'ssl' => array(
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            )
        );
        
        // Expéditeur et destinataire
        $mail->setFrom('yesminebkr24@gmail.com', 'VisioAD Contact');
        $mail->addAddress('yesminebkr24@gmail.com', 'Yasmine'); // À VOUS-MÊME
        $mail->addReplyTo($data['email'], $data['name']); // Pour répondre au client
        
        // Sujet et contenu
        $mail->Subject = '🆕 Nouveau contact VisioAD - ' . htmlspecialchars($data['name']);
        
        // Corps HTML
        $mail->isHTML(true);
        $mail->Body = '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
                .container { max-width: 700px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #d12127 0%, #a81c21 100%); color: white; padding: 30px; text-align: center; }
                .content { padding: 30px; }
                .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
                .info-box { background: #e7f3ff; border-left: 4px solid #007bff; padding: 15px; margin: 20px 0; border-radius: 5px; }
                .field { margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 5px; }
                .label { font-weight: bold; color: #d12127; display: inline-block; width: 150px; }
                .value { color: #333; }
                .message-box { background: white; border: 2px solid #dee2e6; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .actions { margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; }
                .btn { display: inline-block; padding: 10px 20px; background: #d12127; color: white; text-decoration: none; border-radius: 5px; margin-right: 10px; }
                .footer { text-align: center; padding: 20px; background: #f8f9fa; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0; font-size: 28px;">📬 NOUVEAU MESSAGE DE CONTACT</h1>
                    <p style="margin: 10px 0 0; opacity: 0.9;">VisioAD - Formulaire de contact</p>
                </div>
                
                <div class="content">
                    <div class="alert">
                        <strong>⚠️ ACTION REQUISE :</strong> Un nouveau client potentiel a rempli le formulaire de contact.
                    </div>
                    
                    <div class="info-box">
                        <strong>📋 ID du contact :</strong> #' . $contact_id . '<br>
                        <strong>📅 Reçu le :</strong> ' . date('d/m/Y à H:i:s') . '
                    </div>
                    
                    <div class="field">
                        <span class="label">👤 Nom :</span>
                        <span class="value"><strong>' . htmlspecialchars($data['name']) . '</strong></span>
                    </div>
                    
                    <div class="field">
                        <span class="label">📧 Email :</span>
                        <span class="value">
                            <a href="mailto:' . htmlspecialchars($data['email']) . '" style="color: #007bff;">
                                ' . htmlspecialchars($data['email']) . '
                            </a>
                        </span>
                    </div>
                    
                    <div class="field">
                        <span class="label">📞 Téléphone :</span>
                        <span class="value">' . (!empty($data['phone']) ? htmlspecialchars($data['phone']) : '<em>Non fourni</em>') . '</span>
                    </div>
                    
                    <div class="field">
                        <span class="label">📝 Sujet :</span>
                        <span class="value">' . (!empty($data['subject']) ? htmlspecialchars($data['subject']) : '<em>Non spécifié</em>') . '</span>
                    </div>
                    
                    <h3 style="color: #d12127; margin-top: 30px;">💬 Message du client :</h3>
                    <div class="message-box">
                        ' . nl2br(htmlspecialchars($data['message'])) . '
                    </div>
                    
                    <div class="actions">
                        <h3 style="color: #d12127;">🚀 Actions rapides :</h3>
                        <a class="btn" href="mailto:' . htmlspecialchars($data['email']) . '?subject=Réponse à votre demande sur VisioAD">
                            📧 Répondre au client
                        </a>
                        <a class="btn" href="http://localhost/Visioad/admin_contacts.php" style="background: #28a745;">
                            👁️ Voir tous les contacts
                        </a>
                    </div>
                </div>
                
                <div class="footer">
                    <p>📧 Email automatique généré par VisioAD</p>
                    <p>© ' . date('Y') . ' VisioAD - Tous droits réservés</p>
                    <p style="font-size: 10px; margin-top: 10px;">
                        ID: ' . $contact_id . ' | IP: ' . ($_SERVER['REMOTE_ADDR'] ?? 'N/A') . ' | Time: ' . date('H:i:s') . '
                    </p>
                </div>
            </div>
        </body>
        </html>
        ';
        
        // Version texte alternative
        $mail->AltBody = "NOUVEAU CONTACT VISIOAD\n" .
                        "========================\n" .
                        "ID: #" . $contact_id . "\n" .
                        "Nom: " . $data['name'] . "\n" .
                        "Email: " . $data['email'] . "\n" .
                        "Téléphone: " . ($data['phone'] ?? 'Non fourni') . "\n" .
                        "Sujet: " . ($data['subject'] ?? 'Non spécifié') . "\n" .
                        "Message:\n" . $data['message'] . "\n\n" .
                        "Date: " . date('d/m/Y H:i:s') . "\n" .
                        "Répondre à: " . $data['email'];
        
        // Envoyer
        $mail->send();
        
        // Log succès
        file_put_contents('gmail_success.log', 
            date('Y-m-d H:i:s') . " | ✅ SUCCÈS | ID: $contact_id | De: " . $data['email'] . " | À: yesminebkr24@gmail.com\n", 
            FILE_APPEND
        );
        
        return ['success' => true, 'error' => null];
        
    } catch (Exception $e) {
        // Log erreur
        $error_msg = $e->getMessage();
        file_put_contents('gmail_errors.log', 
            date('Y-m-d H:i:s') . " | ❌ ERREUR: " . $error_msg . "\n", 
            FILE_APPEND
        );
        
        return ['success' => false, 'error' => $error_msg];
    }
}
?>