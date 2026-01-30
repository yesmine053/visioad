<?php
// Backend/config/config.php

// Configuration de l'application
define('APP_NAME', 'VisioAD');
define('APP_VERSION', '1.0.0');

// Configuration JWT
define('JWT_SECRET', 'visioad_secret_key_2024_change_in_production');
define('JWT_EXPIRE', 604800); // 7 jours en secondes

// Configuration email (exemple)
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USER', '');
define('SMTP_PASS', '');

// Mode debug
define('DEBUG_MODE', true);

// URL de l'application
define('BASE_URL', 'http://localhost:8080/Visioad');
define('FRONTEND_URL', 'http://localhost:3000');
?>