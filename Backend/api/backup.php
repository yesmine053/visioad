<?php
// backend/api/backup.php

header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/../config/database.php';

$action = $_GET['action'] ?? 'create';

try {
    // Vérifier l'authentification (à implémenter selon vos besoins)
    
    switch($action) {
        case 'create':
            createBackup();
            break;
            
        case 'list':
            listBackups();
            break;
            
        case 'restore':
            restoreBackup();
            break;
            
        case 'delete':
            deleteBackup();
            break;
            
        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Action non reconnue']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur serveur',
        'error' => $e->getMessage()
    ]);
}

function createBackup() {
    global $pdo;
    
    $backup_dir = __DIR__ . '/../../backups/';
    if (!file_exists($backup_dir)) {
        mkdir($backup_dir, 0755, true);
    }
    
    $timestamp = date('Y-m-d_H-i-s');
    $filename = "backup_$timestamp.json";
    $filepath = $backup_dir . $filename;
    
    // Récupérer toutes les tables
    $tables = [];
    $result = $pdo->query("SHOW TABLES");
    while ($row = $result->fetch(PDO::FETCH_NUM)) {
        $tables[] = $row[0];
    }
    
    $backup_data = [
        'timestamp' => $timestamp,
        'database' => 'visioad_blog',
        'tables' => []
    ];
    
    // Sauvegarder chaque table
    foreach ($tables as $table) {
        // Structure de la table
        $create_table = $pdo->query("SHOW CREATE TABLE $table")->fetch(PDO::FETCH_ASSOC);
        
        // Données de la table
        $data_result = $pdo->query("SELECT * FROM $table");
        $data = $data_result->fetchAll(PDO::FETCH_ASSOC);
        
        $backup_data['tables'][$table] = [
            'structure' => $create_table['Create Table'],
            'data' => $data,
            'count' => count($data)
        ];
    }
    
    // Écrire dans le fichier
    $json_data = json_encode($backup_data, JSON_PRETTY_PRINT);
    file_put_contents($filepath, $json_data);
    
    // Enregistrer le backup dans la base de données
    $sql = "INSERT INTO backups (filename, size, tables_count, created_at) 
            VALUES (:filename, :size, :tables_count, NOW())";
    
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':filename', $filename);
    $stmt->bindParam(':size', filesize($filepath), PDO::PARAM_INT);
    $stmt->bindParam(':tables_count', count($tables), PDO::PARAM_INT);
    $stmt->execute();
    
    $backup_id = $pdo->lastInsertId();
    
    echo json_encode([
        'success' => true,
        'message' => 'Sauvegarde créée avec succès',
        'backup' => [
            'id' => $backup_id,
            'filename' => $filename,
            'size' => formatBytes(filesize($filepath)),
            'tables' => count($tables),
            'timestamp' => $timestamp,
            'download_url' => "/backups/$filename"
        ]
    ]);
}

function listBackups() {
    global $pdo;
    
    $sql = "
        SELECT id, filename, size, tables_count, 
               DATE_FORMAT(created_at, '%d/%m/%Y %H:%i') as date_display,
               created_at
        FROM backups 
        ORDER BY created_at DESC
    ";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    
    $backups = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Formater les tailles
    foreach ($backups as &$backup) {
        $backup['size_display'] = formatBytes($backup['size']);
    }
    
    echo json_encode([
        'success' => true,
        'data' => $backups,
        'count' => count($backups)
    ]);
}

// Fonction utilitaire pour formater les bytes
function formatBytes($bytes, $precision = 2) {
    $units = ['B', 'KB', 'MB', 'GB', 'TB'];
    $bytes = max($bytes, 0);
    $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
    $pow = min($pow, count($units) - 1);
    $bytes /= pow(1024, $pow);
    
    return round($bytes, $precision) . ' ' . $units[$pow];
}
?>