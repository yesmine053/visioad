<?php
// check_email_logs.php
echo "<h2>Logs des emails envoyés</h2>";

if (file_exists('email_log.txt')) {
    echo "<pre>" . htmlspecialchars(file_get_contents('email_log.txt')) . "</pre>";
} else {
    echo "Aucun log d'email trouvé.";
}

echo "<h2>Erreurs d'email</h2>";
if (file_exists('email_errors.txt')) {
    echo "<pre>" . htmlspecialchars(file_get_contents('email_errors.txt')) . "</pre>";
} else {
    echo "Aucune erreur d'email.";
}
?>