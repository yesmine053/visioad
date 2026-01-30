<?php
// test_email.php - Fichier pour tester l'envoi d'email directement
require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$mail = new PHPMailer(true);

try {
    // Configuration SMTP
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'yesminebkr24@gmail.com';
    $mail->Password = 'fopp uvdu hoyl udul';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;
    
    $mail->CharSet = 'UTF-8';
    
    // Destinataires
    $mail->setFrom('yesminebkr24@gmail.com', 'Test VisioAD');
    $mail->addAddress('yesminebkr24@gmail.com', 'Yesmine');
    
    // Contenu
    $mail->isHTML(true);
    $mail->Subject = 'Test email depuis PHP';
    $mail->Body = '<h1>Test réussi!</h1><p>Si vous recevez ceci, l\'email fonctionne.</p>';
    $mail->AltBody = 'Test réussi! Si vous recevez ceci, l\'email fonctionne.';
    
    if ($mail->send()) {
        echo "✅ Email envoyé avec succès!";
    } else {
        echo "❌ Erreur d'envoi";
    }
    
} catch (Exception $e) {
    echo "❌ Erreur: " . $mail->ErrorInfo;
}
?>