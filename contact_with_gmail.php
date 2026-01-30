<?php
// contact_with_gmail.php - Utilise Gmail pour envoyer les emails
header("Content-Type: application/json; charset=UTF-8");

// Inclure PHPMailer (téléchargez-le d'abord)
require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // ... (même code pour récupérer les données et insérer en base) ...
    
    // Envoi avec Gmail
    $email_sent = sendEmailWithGmail($data, $contact_id);
    
    // ... (même réponse) ...
}

function sendEmailWithGmail($data, $contact_id) {
    $mail = new PHPMailer(true);
    
    try {
        // Configuration Gmail
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'votre_email@gmail.com'; // VOTRE GMAIL
        $mail->Password = 'votre_mot_de_passe_app'; // MOT DE PASSE D'APPLICATION
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;
        
        // Destinataires
        $mail->setFrom('contact@visioad.com', 'VisioAD');
        $mail->addAddress('yesminebkr24@gmail.com', 'Yasmine');
        $mail->addReplyTo($data['email'], $data['name']);
        
        // Contenu
        $mail->isHTML(true);
        $mail->Subject = 'Nouveau contact VisioAD - ' . $data['name'];
        $mail->Body = '
        <h2>Nouveau message de contact</h2>
        <p><strong>Nom:</strong> ' . $data['name'] . '</p>
        <p><strong>Email:</strong> ' . $data['email'] . '</p>
        <p><strong>Message:</strong><br>' . nl2br($data['message']) . '</p>
        ';
        
        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("Email error: " . $mail->ErrorInfo);
        return false;
    }
}
?>