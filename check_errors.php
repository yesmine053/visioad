<?php
// check_paths.php
echo "<h2>Vérification des chemins</h2>";

$paths = [
    'D:/Xammp/htdocs/Visioad/Backend/api/contact.php' => 'contact.php',
    'D:/Xammp/htdocs/Visioad/Backend/config/database.php' => 'database.php',
    'D:/Xammp/htdocs/Visioad/Backend/models/Contact.php' => 'Contact.php',
    'D:/Xammp/htdocs/Visioad/backend/api/contact.php' => 'contact.php (minuscule)',
    'D:/Xammp/htdocs/Visioad/backend/config/database.php' => 'database.php (minuscule)',
    'D:/Xammp/htdocs/Visioad/backend/models/Contact.php' => 'Contact.php (minuscule)',
];

foreach ($paths as $path => $desc) {
    echo $desc . ": " . (file_exists($path) ? "✅ EXISTE" : "❌ MANQUANT") . "<br>";
    if (file_exists($path)) {
        echo "&nbsp;&nbsp;&nbsp;&nbsp;Taille: " . filesize($path) . " bytes<br>";
    }
}

echo "<h2>Structure actuelle du dossier:</h2>";
function listDir($dir, $level = 0) {
    $items = scandir($dir);
    foreach ($items as $item) {
        if ($item == '.' || $item == '..') continue;
        
        $path = $dir . '/' . $item;
        $indent = str_repeat('&nbsp;&nbsp;&nbsp;&nbsp;', $level);
        
        if (is_dir($path)) {
            echo $indent . "📁 " . $item . "/<br>";
            listDir($path, $level + 1);
        } else {
            echo $indent . "📄 " . $item . " (" . filesize($path) . " bytes)<br>";
        }
    }
}

listDir('D:/Xammp/htdocs/Visioad');
?>