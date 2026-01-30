<?php
// D:/xampp/htdocs/visioad/backend/api/contact.php

// Configuration CORS
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Origin, Accept");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// Répondre aux requêtes OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Activer les logs
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

// Inclure la configuration de la base de données
require_once __DIR__ . '/../config/database.php';

// Initialiser la réponse
$response = [
    'success' => false,
    'message' => 'Action non reconnue',
    'timestamp' => date('Y-m-d H:i:s')
];

// Fonction pour envoyer l'email à l'administrateur
function sendContactEmail($name, $email, $subject, $phone, $message, $contact_id) {
    try {
        // Inclure PHPMailer
        require_once __DIR__ . '/../../PHPMailer/src/Exception.php';
        require_once __DIR__ . '/../../PHPMailer/src/PHPMailer.php';
        require_once __DIR__ . '/../../PHPMailer/src/SMTP.php';
        
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        
        // Configuration SMTP avec VOTRE GMAIL
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'yesminebkr24@gmail.com'; // VOTRE EMAIL
        $mail->Password = 'fopp uvdu hoyl udul'; // VOTRE MOT DE PASSE D'APPLICATION
        $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;
        $mail->CharSet = 'UTF-8';
        
        // Désactiver la vérification SSL pour XAMPP local
        $mail->SMTPOptions = array(
            'ssl' => array(
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            )
        );
        
        // Expéditeur et destinataire
        $mail->setFrom('yesminebkr24@gmail.com', 'VisioAD Contact Form');
        $mail->addAddress('yesminebkr24@gmail.com', 'VisioAD Team'); // Email de réception
        $mail->addReplyTo($email, $name);
        
        // Contenu de l'email
        $mail->isHTML(true);
        $mail->Subject = $subject ?: 'Nouveau message de contact - VisioAD';
        
        // Template HTML de l'email
        $mail->Body = '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #d12127; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; }
                .info-item { margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
                .label { font-weight: bold; color: #d12127; min-width: 120px; display: inline-block; }
                .message-box { background: white; padding: 20px; border-left: 4px solid #d12127; margin: 20px 0; border-radius: 0 5px 5px 0; }
                .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; padding-top: 20px; border-top: 1px solid #ddd; }
                .contact-id { background: #d12127; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📨 Nouveau Message de Contact</h1>
                    <p>Formulaire de contact VisioAD</p>
                </div>
                
                <div class="content">
                    <h2>Informations du client :</h2>
                    
                    <div class="info-item">
                        <span class="label">👤 Nom :</span> ' . htmlspecialchars($name) . '
                    </div>
                    
                    <div class="info-item">
                        <span class="label">📧 Email :</span> <a href="mailto:' . htmlspecialchars($email) . '">' . htmlspecialchars($email) . '</a>
                    </div>';
        
        if ($phone) {
            $mail->Body .= '
                    <div class="info-item">
                        <span class="label">📞 Téléphone :</span> <a href="tel:' . htmlspecialchars($phone) . '">' . htmlspecialchars($phone) . '</a>
                    </div>';
        }
        
        if ($subject) {
            $mail->Body .= '
                    <div class="info-item">
                        <span class="label">📝 Sujet :</span> ' . htmlspecialchars($subject) . '
                    </div>';
        }
        
        $mail->Body .= '
                    <div class="info-item">
                        <span class="label">⏰ Date :</span> ' . date('d/m/Y à H:i:s') . '
                    </div>
                    
                    <div class="info-item">
                        <span class="label">🆔 ID Message :</span> <span class="contact-id">#' . $contact_id . '</span>
                    </div>
                    
                    <h3>📋 Message :</h3>
                    <div class="message-box">
                        ' . nl2br(htmlspecialchars($message)) . '
                    </div>
                    
                    <div style="margin-top: 30px; padding: 15px; background: #e8f4fd; border-radius: 5px;">
                        <p><strong>⚠️ Actions recommandées :</strong></p>
                        <ul>
                            <li>Répondre au client dans les 24h</li>
                            <li>Changer le statut à "répondu" dans le dashboard</li>
                            <li>Conserver cet email comme archive</li>
                        </ul>
                    </div>
                </div>
                
                <div class="footer">
                    <p>📧 Cet email a été envoyé automatiquement depuis le formulaire de contact de VisioAD.</p>
                    <p>© ' . date('Y') . ' VisioAD - Tous droits réservés</p>
                </div>
            </div>
        </body>
        </html>';
        
        // Version texte simple
        $mail->AltBody = "NOUVEAU MESSAGE DE CONTACT - VISIOAD\n" .
                        "====================================\n\n" .
                        "Nom : $name\n" .
                        "Email : $email\n" .
                        ($phone ? "Téléphone : $phone\n" : "") .
                        ($subject ? "Sujet : $subject\n" : "") .
                        "Date : " . date('d/m/Y H:i:s') . "\n" .
                        "ID Message : #$contact_id\n\n" .
                        "MESSAGE :\n" .
                        str_repeat("=", 50) . "\n" .
                        "$message\n\n" .
                        "Cet email a été envoyé automatiquement depuis le formulaire de contact de VisioAD.";
        
        // Envoyer l'email
        if ($mail->send()) {
            error_log("[EMAIL SUCCESS] Email envoyé avec succès à yesminebkr24@gmail.com pour le message #$contact_id");
            return true;
        } else {
            error_log("[EMAIL ERROR] " . $mail->ErrorInfo);
            return false;
        }
        
    } catch (Exception $e) {
        error_log("[EMAIL EXCEPTION] " . $e->getMessage());
        return false;
    }
}

// Fonction pour envoyer un accusé de réception au client
function sendConfirmationEmail($name, $email, $contact_id) {
    try {
        require_once __DIR__ . '/../../PHPMailer/src/Exception.php';
        require_once __DIR__ . '/../../PHPMailer/src/PHPMailer.php';
        require_once __DIR__ . '/../../PHPMailer/src/SMTP.php';
        
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        
        // Configuration SMTP
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'yesminebkr24@gmail.com';
        $mail->Password = 'fopp uvdu hoyl udul';
        $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;
        $mail->CharSet = 'UTF-8';
        
        // Désactiver la vérification SSL pour XAMPP local
        $mail->SMTPOptions = array(
            'ssl' => array(
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            )
        );
        
        // Expéditeur et destinataire
        $mail->setFrom('yesminebkr24@gmail.com', 'VisioAD');
        $mail->addAddress($email, $name);
        
        // Contenu
        $mail->isHTML(true);
        $mail->Subject = 'Confirmation de réception de votre message - VisioAD';
        
        $mail->Body = '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #d12127; color: white; padding: 25px; text-align: center; border-radius: 5px 5px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; }
                .thank-you { font-size: 24px; color: #d12127; margin-bottom: 20px; text-align: center; }
                .info-box { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
                .contact-info { background: #e8f4fd; padding: 15px; border-radius: 5px; margin: 20px 0; }
                .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; padding-top: 20px; border-top: 1px solid #ddd; }
                .id-badge { background: #d12127; color: white; padding: 3px 10px; border-radius: 12px; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✅ Message Reçu !</h1>
                    <p>Merci de nous avoir contactés</p>
                </div>
                
                <div class="content">
                    <div class="thank-you">
                        Cher(e) ' . htmlspecialchars($name) . ', merci !
                    </div>
                    
                    <p>Nous avons bien reçu votre message via notre formulaire de contact et nous vous en remercions.</p>
                    
                    <div class="info-box">
                        <p><strong>📋 Votre demande a été enregistrée sous la référence :</strong></p>
                        <p style="text-align: center; font-size: 18px; margin: 15px 0;">
                            <span class="id-badge">#' . $contact_id . '</span>
                        </p>
                        
                        <p><strong>⏱️ Délai de réponse :</strong></p>
                        <p>Notre équipe va traiter votre demande dans les plus brefs délais. Nous vous répondrons dans un délai maximum de <strong>24 heures</strong>.</p>
                    </div>
                    
                    <div class="contact-info">
                        <h3>📞 Nos coordonnées :</h3>
                        <ul style="list-style: none; padding-left: 0;">
                            <li>📧 <strong>Email :</strong> Info@visioad.com</li>
                            <li>📞 <strong>Téléphone :</strong> +216 31 439 350</li>
                            <li>📍 <strong>Adresse :</strong> Immeuble Centre Ibrahim, Av. Habib Bourguiba, Sousse 4000, Tunisie</li>
                            <li>🌐 <strong>Site web :</strong> www.visioad.com</li>
                        </ul>
                    </div>
                    
                    <p style="text-align: center; margin-top: 30px;">
                        <em>Cordialement,</em><br>
                        <strong style="color: #d12127; font-size: 18px;">L\'équipe VisioAD</strong>
                    </p>
                </div>
                
                <div class="footer">
                    <p>Cet email est un accusé de réception automatique. Merci de ne pas y répondre directement.</p>
                    <p>© ' . date('Y') . ' VisioAD - Tous droits réservés</p>
                </div>
            </div>
        </body>
        </html>';
        
        $mail->AltBody = "Cher(e) $name,\n\n" .
                        "Nous avons bien reçu votre message et nous vous en remercions.\n\n" .
                        "Référence de votre demande : #$contact_id\n\n" .
                        "Notre équipe va traiter votre demande dans les plus brefs délais.\n" .
                        "Nous vous répondrons dans un délai maximum de 24 heures.\n\n" .
                        "Nos coordonnées :\n" .
                        "Email : Info@visioad.com\n" .
                        "Téléphone : +216 31 439 350\n" .
                        "Adresse : Immeuble Centre Ibrahim, Av. Habib Bourguiba, Sousse 4000, Tunisie\n\n" .
                        "Cordialement,\n" .
                        "L'équipe VisioAD";
        
        return $mail->send();
        
    } catch (Exception $e) {
        error_log("[CONFIRMATION EMAIL ERROR] " . $e->getMessage());
        return false;
    }
}

try {
    // Connexion à la base de données
    $database = new Database();
    $pdo = $database->getConnection();
    
    if (!$pdo) {
        throw new Exception('Impossible de se connecter à la base de données');
    }
    
    // Récupérer la méthode HTTP et l'action
    $method = $_SERVER['REQUEST_METHOD'];
    $action = $_GET['action'] ?? '';
    $input = [];
    
    // Récupérer les données d'entrée
    if ($method === 'POST' || $method === 'PUT' || $method === 'DELETE') {
        $rawInput = file_get_contents('php://input');
        if ($rawInput) {
            $input = json_decode($rawInput, true);
        }
    }
    
    // Debug log
    error_log("[CONTACT API] Méthode: $method, Action: $action");
    
    // ============================================
    // 1. SOUMISSION DU FORMULAIRE DE CONTACT (POST)
    // ============================================
    if ($method === 'POST' && $action === '') {
        // Validation des champs obligatoires
        $required = ['name', 'email', 'message'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                throw new Exception("Le champ '$field' est obligatoire");
            }
        }
        
        // Nettoyage des données
        $name = trim(htmlspecialchars($input['name']));
        $email = filter_var(trim($input['email']), FILTER_SANITIZE_EMAIL);
        $subject = isset($input['subject']) ? trim(htmlspecialchars($input['subject'])) : '';
        $phone = isset($input['phone']) ? trim(htmlspecialchars($input['phone'])) : '';
        $message = trim(htmlspecialchars($input['message']));
        
        // Validation email
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new Exception('Adresse email invalide');
        }
        
        // Préparation de la requête SQL
        $sql = "INSERT INTO contacts (name, email, subject, phone, message, status, created_at) 
                VALUES (:name, :email, :subject, :phone, :message, 'new', NOW())";
        
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':subject', $subject);
        $stmt->bindParam(':phone', $phone);
        $stmt->bindParam(':message', $message);
        
        if ($stmt->execute()) {
            $contact_id = $pdo->lastInsertId();
            
            // ============================================
            // ENVOYER LES EMAILS
            // ============================================
            $emailSent = false;
            $confirmationSent = false;
            $emailErrors = [];
            
            // 1. Email à l'administrateur (vous)
            try {
                $emailSent = sendContactEmail($name, $email, $subject, $phone, $message, $contact_id);
                if (!$emailSent) {
                    $emailErrors[] = "Erreur lors de l'envoi de l'email à l'administrateur";
                }
            } catch (Exception $e) {
                $emailErrors[] = "Exception email admin: " . $e->getMessage();
                error_log("[EMAIL ADMIN EXCEPTION] " . $e->getMessage());
            }
            
            // 2. Accusé de réception au client
            try {
                $confirmationSent = sendConfirmationEmail($name, $email, $contact_id);
                if (!$confirmationSent) {
                    $emailErrors[] = "Erreur lors de l'envoi de la confirmation au client";
                }
            } catch (Exception $e) {
                $emailErrors[] = "Exception confirmation: " . $e->getMessage();
                error_log("[CONFIRMATION EXCEPTION] " . $e->getMessage());
            }
            
            // Log des résultats
            error_log("[EMAIL RESULTS] Admin: " . ($emailSent ? 'OK' : 'FAIL') . 
                     " | Client: " . ($confirmationSent ? 'OK' : 'FAIL') . 
                     " | ID: #$contact_id");
            
            // Si c'est une connexion mock, on ajoute les données
            if (method_exists($pdo, 'addMockData')) {
                $pdo->addMockData([
                    'name' => $name,
                    'email' => $email,
                    'phone' => $phone,
                    'subject' => $subject,
                    'message' => $message,
                    'status' => 'new'
                ]);
            }
            
            // Préparer le message de succès
            $successMessage = 'Votre message a été envoyé avec succès !';
            if ($confirmationSent) {
                $successMessage .= ' Un email de confirmation vous a été envoyé.';
            }
            
            $response = [
                'success' => true,
                'message' => $successMessage,
                'contact_id' => (int)$contact_id,
                'email_sent' => $emailSent,
                'confirmation_sent' => $confirmationSent,
                'email_errors' => $emailErrors,
                'data' => [
                    'name' => $name,
                    'email' => $email,
                    'subject' => $subject,
                    'timestamp' => date('Y-m-d H:i:s')
                ]
            ];
            
            // Si échec des emails mais succès BD, on informe quand même
            if (!$emailSent || !$confirmationSent) {
                $response['warning'] = 'Le message a été enregistré mais certains emails n\'ont pas pu être envoyés.';
                $response['debug_info'] = 'Vérifiez la configuration SMTP dans les logs.';
            }
            
        } else {
            $errorInfo = $stmt->errorInfo();
            throw new Exception('Erreur lors de l\'enregistrement: ' . ($errorInfo[2] ?? 'Erreur inconnue'));
        }
    }
    
    // ============================================
    // 2. LISTE DES MESSAGES (GET) - DASHBOARD
    // ============================================
    elseif ($method === 'GET' && $action === 'list') {
        // Si c'est une connexion mock, utiliser les données mockées
        if (method_exists($pdo, 'getMockData')) {
            $messages = $pdo->getMockData();
        } else {
            // Requête SQL réelle
            $sql = "SELECT * FROM contacts ORDER BY created_at DESC";
            $stmt = $pdo->prepare($sql);
            $stmt->execute();
            $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        
        // Formater la réponse
        $response = [
            'success' => true,
            'messages' => $messages,
            'total' => count($messages),
            'count' => count($messages)
        ];
    }
    
    // ============================================
    // 3. MARQUER COMME LU (PUT)
    // ============================================
    elseif ($method === 'PUT' && $action === 'read') {
        $id = $input['id'] ?? 0;
        
        if (!$id) {
            throw new Exception('ID requis');
        }
        
        // Si c'est une connexion mock
        if (method_exists($pdo, 'updateMockData')) {
            $success = $pdo->updateMockData($id, ['status' => 'read']);
        } else {
            // Requête SQL réelle
            $sql = "UPDATE contacts SET status = 'read' WHERE id = :id";
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $success = $stmt->execute();
        }
        
        $response = [
            'success' => (bool)$success,
            'message' => $success ? 'Message marqué comme lu' : 'Message non trouvé',
            'id' => $id
        ];
    }
    
    // ============================================
    // 4. MARQUER COMME RÉPONDU (PUT)
    // ============================================
    elseif ($method === 'PUT' && $action === 'replied') {
        $id = $input['id'] ?? 0;
        
        if (!$id) {
            throw new Exception('ID requis');
        }
        
        // Si c'est une connexion mock
        if (method_exists($pdo, 'updateMockData')) {
            $success = $pdo->updateMockData($id, ['status' => 'replied']);
        } else {
            // Requête SQL réelle
            $sql = "UPDATE contacts SET status = 'replied' WHERE id = :id";
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $success = $stmt->execute();
        }
        
        $response = [
            'success' => (bool)$success,
            'message' => $success ? 'Message marqué comme répondu' : 'Message non trouvé',
            'id' => $id
        ];
    }
    
    // ============================================
    // 5. SUPPRIMER UN MESSAGE (DELETE)
    // ============================================
    elseif ($method === 'DELETE' && $action === 'delete') {
        $id = $input['id'] ?? 0;
        
        if (!$id) {
            throw new Exception('ID requis');
        }
        
        // Si c'est une connexion mock
        if (method_exists($pdo, 'deleteMockData')) {
            $success = $pdo->deleteMockData($id);
        } else {
            // Requête SQL réelle
            $sql = "DELETE FROM contacts WHERE id = :id";
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':id', $id, PDO::PARAM_INT);
            $success = $stmt->execute();
        }
        
        $response = [
            'success' => (bool)$success,
            'message' => $success ? 'Message supprimé' : 'Message non trouvé',
            'id' => $id
        ];
    }
    
    // ============================================
    // 6. STATISTIQUES (GET)
    // ============================================
    elseif ($method === 'GET' && $action === 'stats') {
        // Si c'est une connexion mock
        if (method_exists($pdo, 'getMockData')) {
            $messages = $pdo->getMockData();
        } else {
            $sql = "SELECT * FROM contacts";
            $stmt = $pdo->prepare($sql);
            $stmt->execute();
            $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        
        // Calculer les statistiques
        $stats = [
            'total' => count($messages),
            'new' => 0,
            'read' => 0,
            'replied' => 0,
            'today' => 0
        ];
        
        $today = date('Y-m-d');
        foreach ($messages as $msg) {
            if (isset($msg['status'])) {
                $stats[$msg['status']] = ($stats[$msg['status']] ?? 0) + 1;
            }
            
            if (isset($msg['created_at']) && strpos($msg['created_at'], $today) === 0) {
                $stats['today']++;
            }
        }
        
        $response = [
            'success' => true,
            'stats' => $stats,
            'demo_mode' => method_exists($pdo, 'getMockData')
        ];
    }
    
    // ============================================
    // 7. ACTION NON RECONNUE
    // ============================================
    else {
        http_response_code(404);
        $response['message'] = "Action '$action' non prise en charge pour la méthode $method";
    }
    
} catch (Exception $e) {
    http_response_code(400);
    $response = [
        'success' => false,
        'message' => $e->getMessage(),
        'error' => true,
        'timestamp' => date('Y-m-d H:i:s'),
        'input_data' => $input ?? []
    ];
    
    error_log("[CONTACT API ERROR] " . $e->getMessage());
    error_log("[CONTACT API DEBUG] Input: " . json_encode($input ?? []));
}

// Envoyer la réponse JSON
echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
exit();
?>