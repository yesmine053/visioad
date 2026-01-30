<?php
// test_minimal.php
echo "PHP est fonctionnel !<br>";
echo "Version PHP: " . phpversion() . "<br>";
echo "Server: " . $_SERVER['SERVER_SOFTWARE'] . "<br>";

// Tester MySQL
echo "<h3>Test MySQL:</h3>";
try {
    $link = mysqli_connect("localhost", "root", "");
    if ($link) {
        echo "✅ Connexion MySQL réussie<br>";
        mysqli_close($link);
    } else {
        echo "❌ Échec MySQL: " . mysqli_connect_error() . "<br>";
    }
} catch (Exception $e) {
    echo "❌ Exception MySQL: " . $e->getMessage() . "<br>";
}

// Tester les permissions d'écriture
echo "<h3>Permissions:</h3>";
$test_file = __DIR__ . '/test_write.txt';
if (file_put_contents($test_file, "Test")) {
    echo "✅ Écriture fichier OK<br>";
    unlink($test_file);
} else {
    echo "❌ Écriture fichier échouée<br>";
}

// Tester les inclusions
echo "<h3>Inclusions:</h3>";
$files_to_test = [
    'Visioad/backend/config/database.php',
    'Visioad/backend/models/Contact.php',
    'Visioad/backend/api/contact.php'
];

foreach ($files_to_test as $file) {
    $full_path = __DIR__ . '/' . $file;
    if (file_exists($full_path)) {
        echo "✅ $file existe<br>";
    } else {
        echo "❌ $file manquant<br>";
    }
}
?>