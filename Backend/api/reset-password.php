// Backend/api/reset-password.php
<?php
require_once __DIR__ . '/../config/database.php';

$new_password = 'Admin2026'; // Changez ceci
$hashed_password = password_hash($new_password, PASSWORD_DEFAULT);

$sql = "UPDATE users SET password = :password WHERE id = 1";
$stmt = $pdo->prepare($sql);
$result = $stmt->execute([':password' => $hashed_password]);

if ($result) {
    echo "✅ Mot de passe réinitialisé avec succès !<br>";
    echo "Nouveau mot de passe : <strong>$new_password</strong><br>";
    echo "Email : admin@visioad.com<br>";
    echo "<br><a href='http://localhost:3000/login' target='_blank'>Se connecter maintenant</a>";
} else {
    echo "❌ Erreur lors de la réinitialisation.";
}
?>