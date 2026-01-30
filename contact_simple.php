<?php
// contact_simple.php - Version simple et fiable
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Récupérer les données
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    // Si JSON invalide, essayer $_POST
    if (!$data && !empty($_POST)) {
        $data = $_POST;
    }
    
    // Validation
    if (empty($data['name']) || empty($data['email']) || empty($data['message'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Nom, email et message sont requis'
        ]);
        exit;
    }
    
    // Validation email
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Adresse email invalide'
        ]);
        exit;
    }
    
    try {
        // Connexion DB
        $pdo = new PDO('mysql:host=localhost;dbname=visioad_db;charset=utf8', 'root', '');
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        // Insertion
        $stmt = $pdo->prepare("
            INSERT INTO contacts (name, email, phone, subject, message, status, created_at) 
            VALUES (:name, :email, :phone, :subject, :message, 'new', NOW())
        ");
        
        $stmt->execute([
            ':name' => htmlspecialchars($data['name']),
            ':email' => htmlspecialchars($data['email']),
            ':phone' => htmlspecialchars($data['phone'] ?? ''),
            ':subject' => htmlspecialchars($data['subject'] ?? ''),
            ':message' => htmlspecialchars($data['message'])
        ]);
        
        $contact_id = $pdo->lastInsertId();
        
        // Réponse succès
        echo json_encode([
            'success' => true,
            'message' => 'Message envoyé avec succès !',
            'contact_id' => $contact_id
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Erreur serveur: ' . $e->getMessage()
        ]);
    }
} else {
    // Pour GET
    echo json_encode([
        'api' => 'VisioAD Contact API',
        'status' => 'active',
        'usage' => 'Envoyez une requête POST avec des données JSON'
    ]);
}
?>