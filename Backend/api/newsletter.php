<?php
// backend/api/newsletter.php

error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Récupérer les données
    $json = file_get_contents('php://input');
    $data = json_decode($json);
    
    if (empty($data) && !empty($_POST)) {
        $data = (object) $_POST;
    }
    
    if ($data && !empty($data->email)) {
        $email = filter_var($data->email, FILTER_SANITIZE_EMAIL);
        
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "Email invalide."
            ]);
            exit();
        }

        // Vérifier si l'email existe déjà
        $query = "SELECT id FROM newsletter WHERE email = :email";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":email", $email);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            echo json_encode([
                "success" => true,
                "message" => "Vous êtes déjà inscrit à notre newsletter."
            ]);
        } else {
            $query = "INSERT INTO newsletter (email) VALUES (:email)";
            $stmt = $db->prepare($query);
            $stmt->bindParam(":email", $email);

            if ($stmt->execute()) {
                echo json_encode([
                    "success" => true,
                    "message" => "Merci pour votre inscription !"
                ]);
            } else {
                http_response_code(500);
                echo json_encode([
                    "success" => false,
                    "message" => "Erreur lors de l'inscription."
                ]);
            }
        }
    } else {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Email requis."
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Méthode non autorisée."
    ]);
}
?>