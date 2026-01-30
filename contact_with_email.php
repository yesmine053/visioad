<?php
// contact_with_email.php - Version avec envoi d'email
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Récupérer les données
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    // Si JSON invalide, essayer $_POST
    if (!$data && !empty($_POST)) {
        $data = $_POST;
    }
    
    // Validation
    if (empty($data['name']) || empty($data['email']) || empty($data['message'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Nom, email et message sont requis'
        ]);
        exit;
    }
    
    // Validation email
    if (!filter_var($data['name'], FILTER_SANITIZE_EMAIL)) {
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
        
        // 3. ENVOYER L'EMAIL À VOUS (Yasmine)
        $email_sent = sendContactEmail($data, $contact_id);
        
        // 4. Réponse
        if ($email_sent) {
            echo json_encode([
                'success' => true,
                'message' => 'Message envoyé avec succès ! Vous recevrez une réponse rapidement.',
                'contact_id' => $contact_id,
                'email_sent' => true
            ]);
        } else {
            // Même si l'email échoue, on a enregistré en base
            echo json_encode([
                'success' => true,
                'message' => 'Message enregistré. Nous vous contacterons bientôt.',
                'contact_id' => $contact_id,
                'email_sent' => false,
                'note' => 'L\'email n\'a pas pu être envoyé mais le message est sauvegardé.'
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
        'api' => 'VisioAD Contact API avec Email',
        'status' => 'active',
        'your_email' => 'yesminebkr24@gmail.com',
        'usage' => 'Envoyez une requête POST avec des données JSON'
    ]);
}

// FONCTION POUR ENVOYER L'EMAIL
function sendContactEmail($data, $contact_id) {
    // VOTRE EMAIL ICI
    $to = "yesminebkr24@gmail.com";
    
    // Sujet de l'email
    $subject = "📧 Nouveau contact VisioAD - " . $data['name'];
    
    // Contenu HTML de l'email
    $message = '
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; }
            .header { background-color: #d12127; color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .field { margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
            .label { font-weight: bold; color: #d12127; display: inline-block; width: 120px; }
            .value { color: #333; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px; }
            .important { background-color: #fff3cd; padding: 10px; border-left: 4px solid #ffc107; margin: 15px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>🆕 NOUVEAU MESSAGE DE CONTACT</h2>
                <p>VisioAD - Formulaire de contact</p>
            </div>
            
            <div class="content">
                <div class="important">
                    <strong>⚠️ ACTION REQUISE :</strong> Un nouveau client a rempli le formulaire de contact.
                </div>
                
                <div class="field">
                    <span class="label">📋 ID Contact:</span>
                    <span class="value">#' . $contact_id . '</span>
                </div>
                
                <div class="field">
                    <span class="label">👤 Nom complet:</span>
                    <span class="value">' . htmlspecialchars($data['name']) . '</span>
                </div>
                
                <div class="field">
                    <span class="label">📧 Email:</span>
                    <span class="value">
                        <a href="mailto:' . htmlspecialchars($data['email']) . '">' . htmlspecialchars($data['email']) . '</a>
                    </span>
                </div>
                
                <div class="field">
                    <span class="label">📞 Téléphone:</span>
                    <span class="value">' . (!empty($data['phone']) ? htmlspecialchars($data['phone']) : 'Non fourni') . '</span>
                </div>
                
                <div class="field">
                    <span class="label">📝 Sujet:</span>
                    <span class="value">' . (!empty($data['subject']) ? htmlspecialchars($data['subject']) : 'Non spécifié') . '</span>
                </div>
                
                <div class="field" style="border-bottom: none;">
                    <div class="label">💬 Message:</div>
                    <div class="value" style="margin-top: 10px; padding: 15px; background: white; border: 1px solid #ddd; border-radius: 5px;">
                        ' . nl2br(htmlspecialchars($data['message'])) . '
                    </div>
                </div>
                
                <div class="field">
                    <span class="label">📅 Date:</span>
                    <span class="value">' . date('d/m/Y à H:i:s') . '</span>
                </div>
                
                <div style="margin-top: 20px; padding: 15px; background: #e7f3ff; border-radius: 5px;">
                    <strong>📲 Actions rapides:</strong><br>
                    1. <a href="mailto:' . htmlspecialchars($data['email']) . '?subject=Réponse à votre demande&body=Bonjour ' . htmlspecialchars($data['name']) . ',">Répondre par email</a><br>
                    2. Ajouter à votre CRM<br>
                    3. Planifier un appel
                </div>
            </div>
            
            <div class="footer">
                <p>Ce message a été généré automatiquement depuis le formulaire de contact de <strong>VisioAD</strong></p>
                <p>© ' . date('Y') . ' VisioAD - Tous droits réservés</p>
            </div>
        </div>
    </body>
    </html>
    ';
    
    // Headers pour email HTML
    $headers = "From: contact@visioad.com\r\n";
    $headers .= "Reply-To: " . $data['email'] . "\r\n";
    $headers .= "CC: yesminebkr24@gmail.com\r\n"; // En copie aussi
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "X-Priority: 1 (Highest)\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();
    
    // Essayer d'envoyer l'email
    try {
        $result = mail($to, $subject, $message, $headers);
        
        // Log pour déboguer
        file_put_contents('email_log.txt', 
            date('Y-m-d H:i:s') . 
            " | ID: $contact_id | To: $to | From: " . $data['email'] . 
            " | Success: " . ($result ? 'Yes' : 'No') . "\n", 
            FILE_APPEND
        );
        
        return $result;
    } catch (Exception $e) {
        // Log l'erreur
        file_put_contents('email_errors.txt', 
            date('Y-m-d H:i:s') . " | Error: " . $e->getMessage() . "\n", 
            FILE_APPEND
        );
        return false;
    }
}
?>