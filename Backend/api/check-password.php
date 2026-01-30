// Backend/api/check-password.php
<?php
require_once __DIR__ . '/../config/database.php';

$sql = "SELECT password FROM users WHERE id = 1";
$stmt = $pdo->query($sql);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

echo "Hash actuel dans la BD :<br>";
echo "<code>" . $user['password'] . "</code><br><br>";

// Tester plusieurs mots de passe
$passwords_to_test = ['Admin2026', 'admin2026', 'Admin2024!', 'password', 'admin123', 'Admin123'];

echo "Tests de vérification :<br>";
foreach ($passwords_to_test as $pwd) {
    $is_valid = password_verify($pwd, $user['password']);
    echo $pwd . " : " . ($is_valid ? "✅ VALIDE" : "❌ INVALIDE") . "<br>";
}
?>