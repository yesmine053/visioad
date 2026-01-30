// Créez api/index.php pour gérer toutes les routes
<?php
header("Content-Type: application/json");

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

switch($path) {
    case '/api/contact':
        if ($method === 'POST') require 'contact.php';
        break;
    case '/api/newsletter':
        if ($method === 'POST') require 'newsletter.php';
        break;
    case '/api/blog':
        if ($method === 'GET') require 'blog.php';
        break;
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Route non trouvée']);
}
?>