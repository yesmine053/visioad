<?php
// Backend/config/database.php

class Database {
    private string $host     = 'localhost';
    private string $dbName   = 'visioad_db';
    private string $username = 'root';
    private string $password = '';
    private ?PDO   $conn     = null;

    public function getConnection(): PDO {
        if ($this->conn !== null) return $this->conn;

        try {
            $this->conn = new PDO(
                "mysql:host={$this->host};dbname={$this->dbName};charset=utf8mb4",
                $this->username,
                $this->password,
                [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                ]
            );
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Erreur DB : ' . $e->getMessage()]);
            exit();
        }

        return $this->conn;
    }
}
?>