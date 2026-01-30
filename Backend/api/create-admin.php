// create-admin.php dans Backend/api/
<?php
require_once __DIR__ . '/../config/database.php';

$hashed_password = password_hash('admin123', PASSWORD_DEFAULT);

$sql = "INSERT INTO users (username, email, password, role, verified, status, created_at) 
        VALUES (:username, :email, :password, :role, :verified, :status, NOW())";

$stmt = $pdo->prepare($sql);
$result = $stmt->execute([
    ':username' => 'admin',
    ':email' => 'admin@visioad.com',
    ':password' => $hashed_password,
    ':role' => 'admin',
    ':verified' => 1,
    ':status' => 'active'
]);

if ($result) {
    echo "Admin créé avec succès!<br>";
    echo "Email: admin@visioad.com<br>";
    echo "Mot de passe: admin123";
} else {
    echo "Erreur: " . implode(", ", $stmt->errorInfo());
}
?>