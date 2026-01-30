<?php
// backend/middleware/AuthMiddleware.php

class AuthMiddleware {
    
    public static function authenticate() {
        $token = self::getBearerToken();
        
        if (!$token) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Authentification requise']);
            exit();
        }
        
        try {
            $payload = JWT::decode($token);
            return $payload;
        } catch (Exception $e) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Token invalide']);
            exit();
        }
    }
    
    public static function authorize($requiredRole = null, $requiredPermission = null) {
        $user = self::authenticate();
        
        if ($requiredRole && $user['role'] !== $requiredRole) {
            // Vérifier si l'utilisateur a un rôle supérieur
            $roleHierarchy = ['visitor' => 1, 'client' => 2, 'admin' => 3];
            
            if (!isset($roleHierarchy[$user['role']]) || 
                !isset($roleHierarchy[$requiredRole]) ||
                $roleHierarchy[$user['role']] < $roleHierarchy[$requiredRole]) {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Permissions insuffisantes']);
                exit();
            }
        }
        
        if ($requiredPermission) {
            global $pdo;
            $sql = "SELECT COUNT(*) as has_permission 
                    FROM permissions p
                    JOIN role_permissions rp ON p.id = rp.permission_id
                    WHERE rp.role = :role AND p.name = :permission";
            
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':role', $user['role']);
            $stmt->bindParam(':permission', $requiredPermission);
            $stmt->execute();
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$result['has_permission']) {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Permission refusée']);
                exit();
            }
        }
        
        return $user;
    }
    
    private static function getBearerToken() {
        $headers = getallheaders();
        if (isset($headers['Authorization'])) {
            if (preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
                return $matches[1];
            }
        }
        return null;
    }
}

// Exemple d'utilisation dans votre API
/*
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

// Pour une route protégée
$user = AuthMiddleware::authenticate();

// Pour une route nécessitant un rôle spécifique
$user = AuthMiddleware::authorize('admin');

// Pour une route nécessitant une permission spécifique
$user = AuthMiddleware::authorize(null, 'manage_users');
*/
?>