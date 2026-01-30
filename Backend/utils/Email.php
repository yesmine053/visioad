<?php
// Backend/utils/Email.php

class Email {
    
    // Envoyer un email de vérification
    public static function sendVerificationEmail($to, $name, $verification_link) {
        $subject = 'Vérifiez votre compte VisioAD';
        
        $message = "
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
                .header { background: #d12127; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                .content { padding: 30px; background: #f9f9f9; }
                .button { display: inline-block; padding: 12px 30px; background: #d12127; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }
                .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>Bienvenue sur VisioAD!</h1>
                </div>
                <div class='content'>
                    <h2>Bonjour $name,</h2>
                    <p>Merci de vous être inscrit sur VisioAD. Pour compléter votre inscription, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :</p>
                    
                    <p style='text-align: center; margin: 40px 0;'>
                        <a href='$verification_link' class='button'>
                            Vérifier mon email
                        </a>
                    </p>
                    
                    <p>Si le bouton ne fonctionne pas, vous pouvez copier-coller ce lien dans votre navigateur :</p>
                    <p style='background: #eee; padding: 10px; border-radius: 3px; word-break: break-all;'>
                        $verification_link
                    </p>
                    
                    <p>Ce lien expirera dans 24 heures.</p>
                    
                    <p>Si vous n'avez pas créé de compte sur VisioAD, veuillez ignorer cet email.</p>
                </div>
                <div class='footer'>
                    <p>Cordialement,<br>L'équipe VisioAD</p>
                    <p>© 2024 VisioAD. Tous droits réservés.</p>
                </div>
            </div>
        </body>
        </html>
        ";
        
        // En-têtes de l'email
        $headers = [
            'MIME-Version: 1.0',
            'Content-type: text/html; charset=utf-8',
            'From: VisioAD <no-reply@visioad.com>',
            'Reply-To: support@visioad.com',
            'X-Mailer: PHP/' . phpversion()
        ];
        
        // Pour le développement, on simule l'envoi
        // En production, remplacez par mail() ou une bibliothèque comme PHPMailer
        if (self::isDevelopment()) {
            // En développement, on log juste l'email
            error_log("DEV EMAIL: Verification link for $to: $verification_link");
            return true;
        } else {
            // En production, envoyer réellement l'email
            return mail($to, $subject, $message, implode("\r\n", $headers));
        }
    }
    
    // Envoyer un email de réinitialisation de mot de passe
    public static function sendPasswordResetEmail($to, $name, $reset_link) {
        $subject = 'Réinitialisation de votre mot de passe VisioAD';
        
        $message = "
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
                .header { background: #d12127; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                .content { padding: 30px; background: #f9f9f9; }
                .button { display: inline-block; padding: 12px 30px; background: #d12127; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }
                .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
                .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>Réinitialisation de mot de passe</h1>
                </div>
                <div class='content'>
                    <h2>Bonjour $name,</h2>
                    <p>Vous avez demandé à réinitialiser votre mot de passe VisioAD. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
                    
                    <p style='text-align: center; margin: 40px 0;'>
                        <a href='$reset_link' class='button'>
                            Réinitialiser mon mot de passe
                        </a>
                    </p>
                    
                    <div class='warning'>
                        <strong>⚠️ Important :</strong>
                        <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email. Votre mot de passe actuel restera valide.</p>
                    </div>
                    
                    <p>Si le bouton ne fonctionne pas, copiez-collez ce lien :</p>
                    <p style='background: #eee; padding: 10px; border-radius: 3px; word-break: break-all;'>
                        $reset_link
                    </p>
                    
                    <p>Ce lien expirera dans 1 heure pour des raisons de sécurité.</p>
                </div>
                <div class='footer'>
                    <p>Cordialement,<br>L'équipe sécurité VisioAD</p>
                    <p>© 2024 VisioAD. Tous droits réservés.</p>
                </div>
            </div>
        </body>
        </html>
        ";
        
        $headers = [
            'MIME-Version: 1.0',
            'Content-type: text/html; charset=utf-8',
            'From: VisioAD Security <security@visioad.com>',
            'Reply-To: no-reply@visioad.com',
            'X-Mailer: PHP/' . phpversion()
        ];
        
        if (self::isDevelopment()) {
            error_log("DEV EMAIL: Password reset link for $to: $reset_link");
            return true;
        } else {
            return mail($to, $subject, $message, implode("\r\n", $headers));
        }
    }
    
    // Envoyer un email de bienvenue
    public static function sendWelcomeEmail($to, $name) {
        $subject = 'Bienvenue sur VisioAD !';
        
        $message = "
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { text-align: center; padding: 20px 0; }
                .logo { max-width: 200px; margin: 0 auto; }
                .content { padding: 30px 0; }
                .feature { margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 5px; }
                .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; text-align: center; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1 style='color: #d12127;'>🎉 Bienvenue $name !</h1>
                    <p>Votre compte VisioAD est maintenant actif</p>
                </div>
                
                <div class='content'>
                    <p>Nous sommes ravis de vous accueillir dans notre communauté. Voici ce que vous pouvez faire dès maintenant :</p>
                    
                    <div class='feature'>
                        <h3>🚀 Explorer nos services</h3>
                        <p>Découvrez comment VisioAD peut booster votre présence digitale.</p>
                    </div>
                    
                    <div class='feature'>
                        <h3>📚 Accéder au blog</h3>
                        <p>Consultez nos articles experts en marketing digital et développement web.</p>
                    </div>
                    
                    <div class='feature'>
                        <h3>👤 Compléter votre profil</h3>
                        <p>Ajoutez votre entreprise et vos informations pour une expérience personnalisée.</p>
                    </div>
                    
                    <p style='text-align: center; margin-top: 30px;'>
                        <a href='https://visioad.vercel.app' style='padding: 12px 30px; background: #d12127; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;'>
                            Commencer l'exploration
                        </a>
                    </p>
                </div>
                
                <div class='footer'>
                    <p>Besoin d'aide ? Contactez notre équipe à support@visioad.com</p>
                    <p>© 2024 VisioAD. Tous droits réservés.</p>
                </div>
            </div>
        </body>
        </html>
        ";
        
        $headers = [
            'MIME-Version: 1.0',
            'Content-type: text/html; charset=utf-8',
            'From: VisioAD <welcome@visioad.com>',
            'Reply-To: support@visioad.com',
            'X-Mailer: PHP/' . phpversion()
        ];
        
        if (self::isDevelopment()) {
            error_log("DEV EMAIL: Welcome email sent to $to");
            return true;
        } else {
            return mail($to, $subject, $message, implode("\r\n", $headers));
        }
    }
    
    // Vérifier si on est en environnement de développement
    private static function isDevelopment() {
        return $_SERVER['SERVER_NAME'] === 'localhost' || 
               strpos($_SERVER['SERVER_NAME'], '127.0.0.1') !== false ||
               $_SERVER['SERVER_NAME'] === 'localhost:8080';
    }
}
?>