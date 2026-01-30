// Backend/api/reset-password.php
<?php
require_once __DIR__ . '/../config/database.php';

$new_password = 'Admin2026';
$hashed_password = password_hash($new_password, PASSWORD_DEFAULT);

$sql = "UPDATE users SET password = :password WHERE id = 1";
$stmt = $pdo->prepare($sql);
$result = $stmt->execute([':password' => $hashed_password]);

if ($result) {
    echo "✅ Mot de passe réinitialisé avec succès !<br>";
    echo "<strong>Nouveau mot de passe : $new_password</strong><br>";
    echo "Email : admin@visioad.com<br>";
    echo "<br>Testez maintenant : <a href='http://localhost:3000/login' target='_blank'>http://localhost:3000/login</a>";
    
    // Afficher le hash pour vérification
    echo "<br><br>Hash stocké : " . $hashed_password;
} else {
    echo "❌ Erreur lors de la réinitialisation.";
}
?>