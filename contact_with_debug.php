<?php
// contact_with_debug.php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once 'PHPMailer/src/PHPMailer.php';
require_once 'PHPMailer/src/SMTP.php';
require_once 'PHPMailer/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;

$mail = new PHPMailer(true);
$mail->SMTPDebug = 2; // Niveau de débogage maximum
$mail->Debugoutput = function($str, $level) {
    file_put_contents('smtp_debug.log', date('Y-m-d H:i:s') . " [$level] $str\n", FILE_APPEND);
};

try {
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'yesminebkr24@gmail.com';
    $mail->Password = 'fopp uvdu hoyl udul';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;
    
    $mail->setFrom('yesminebkr24@gmail.com', 'VisioAD');
    $mail->addAddress('yesminebkr24@gmail.com');
    
    $mail->Subject = 'Test Debug';
    $mail->Body = 'Test';
    
    $mail->send();
    echo json_encode(['success' => true]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $mail->ErrorInfo
    ]);
}
?>