<?php
// test_direct.php
echo "<h2>Test direct de l'API</h2>";

// Test 1 : Données JSON
echo "<h3>Test avec données JSON :</h3>";
$url = 'http://localhost/Visioad/contact_fixed.php';
$data = [
    'name' => 'Test PHP',
    'email' => 'test@php.com',
    'message' => 'Test depuis PHP'
];

$options = [
    'http' => [
        'header'  => "Content-type: application/json\r\n",
        'method'  => 'POST',
        'content' => json_encode($data),
    ],
];

$context = stream_context_create($options);
$result = @file_get_contents($url, false, $context);

if ($result === FALSE) {
    echo "❌ Erreur d'envoi<br>";
    $error = error_get_last();
    echo "Détails: " . $error['message'];
} else {
    echo "✅ Réponse :<br>";
    echo "<pre>" . htmlspecialchars($result) . "</pre>";
    
    // Vérifier si c'est du JSON
    $json = json_decode($result);
    if (json_last_error() === JSON_ERROR_NONE) {
        echo "✅ JSON valide<br>";
        if ($json->success) {
            echo "🎉 SUCCÈS ! Message enregistré.";
        }
    } else {
        echo "❌ JSON invalide: " . json_last_error_msg();
    }
}

// Vérifier le fichier log
echo "<h3>Fichier de log :</h3>";
$log_file = 'api_log.txt';
if (file_exists($log_file)) {
    echo "<pre>" . htmlspecialchars(file_get_contents($log_file)) . "</pre>";
} else {
    echo "Aucun log trouvé.";
}
?>