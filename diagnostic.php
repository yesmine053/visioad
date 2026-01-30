<?php
// diagnostic.php
echo "<h1>Diagnostic XAMPP/PHP</h1>";

echo "<h2>1. Configuration PHP</h2>";
phpinfo();

echo "<h2>2. Variables d'environnement</h2>";
echo "<pre>";
print_r($_SERVER);
echo "</pre>";

echo "<h2>3. Modules Apache chargés</h2>";
if (function_exists('apache_get_modules')) {
    echo "<pre>";
    print_r(apache_get_modules());
    echo "</pre>";
} else {
    echo "apache_get_modules() non disponible<br>";
}

echo "<h2>4. Dernières erreurs</h2>";
$error_log = ini_get('error_log');
echo "error_log: " . ($error_log ?: 'Non défini') . "<br>";

if ($error_log && file_exists($error_log)) {
    echo "<pre>" . htmlspecialchars(file_get_contents($error_log)) . "</pre>";
} else {
    // Chercher dans d'autres emplacements
    $possible_logs = [
        'D:/Xammp/php/logs/php_error.log',
        'D:/Xammp/apache/logs/error.log',
        'C:/Windows/Temp/php-errors.log'
    ];
    
    foreach ($possible_logs as $log) {
        if (file_exists($log)) {
            echo "<h3>Log trouvé: $log</h3>";
            echo "<pre>" . htmlspecialchars(file_get_contents($log)) . "</pre>";
            break;
        }
    }
}
?>