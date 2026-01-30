// Backend/api/final-test.php
<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/JWT.php';

// 1. Réinitialiser avec un mot de passe simple
$password = 'admin123';
$hashed = password_hash($password, PASSWORD_DEFAULT);

$sql = "UPDATE users SET password = :pass WHERE id = 1";
$stmt = $pdo->prepare($sql);
$stmt->execute([':pass' => $hashed]);

echo "<h2>🔧 Configuration Admin Terminée</h2>";
echo "<div style='background:#d4edda; padding:20px; border-radius:10px; margin:20px 0;'>";
echo "<h3>✅ Identifiants de connexion :</h3>";
echo "<p><strong>Email :</strong> admin@visioad.com</p>";
echo "<p><strong>Mot de passe :</strong> $password</p>";
echo "</div>";

// 2. Tester la connexion
echo "<h3>🧪 Test de connexion API :</h3>";

// Simuler une requête de connexion
$test_data = [
    'email' => 'admin@visioad.com',
    'password' => $password
];

$user_sql = "SELECT * FROM users WHERE email = :email";
$user_stmt = $pdo->prepare($user_sql);
$user_stmt->execute([':email' => $test_data['email']]);
$user = $user_stmt->fetch(PDO::FETCH_ASSOC);

if ($user && password_verify($test_data['password'], $user['password'])) {
    echo "<p style='color:green;'>✅ Mot de passe vérifié avec succès !</p>";
    
    // Générer un token
    $token = JWT::encode([
        'id' => $user['id'],
        'email' => $user['email'],
        'role' => $user['role'],
        'name' => $user['username'],
        'exp' => time() + 3600
    ]);
    
    echo "<p><strong>Token généré :</strong> " . substr($token, 0, 50) . "...</p>";
    
} else {
    echo "<p style='color:red;'>❌ Échec de vérification</p>";
}

// 3. Lien de test
echo "<h3>🔗 Liens de test :</h3>";
echo "<ul>";
echo "<li><a href='http://localhost:3000/login' target='_blank'>Page de connexion Next.js</a></li>";
echo "<li><a href='auth.php?action=check' target='_blank'>Test API auth</a></li>";
echo "<li><a href='test-login.php' target='_blank'>Test PHP direct</a></li>";
echo "</ul>";

// 4. Code curl pour tester
echo "<h3>📟 Commande curl pour tester :</h3>";
echo "<pre style='background:#333; color:#fff; padding:10px; border-radius:5px;'>";
echo "curl -X POST \"http://localhost:8080/Visioad/Backend/api/auth.php?action=login\" \\\n";
echo "  -H \"Content-Type: application/json\" \\\n";
echo "  -d '{\"email\":\"admin@visioad.com\",\"password\":\"$password\"}'";
echo "</pre>";
?>