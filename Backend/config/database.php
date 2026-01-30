<?php
// Backend/config/database.php

class Database {
    private $host = "localhost";
    private $db_name = "visioad_db";
    private $username = "root";
    private $password = "";
    private $conn;
    
    public function getConnection() {
        $this->conn = null;
        
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4",
                $this->username,
                $this->password,
                array(
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                )
            );
            
            error_log("[DATABASE] Connexion réussie à la base de données");
            
        } catch(PDOException $e) {
            error_log("[DATABASE ERROR] " . $e->getMessage());
            
            // Pour le développement, on retourne une connexion mock
            return $this->createMockConnection();
        }
        
        return $this->conn;
    }
    
    // Créer une connexion mock pour le développement
    private function createMockConnection() {
        error_log("[DATABASE] Utilisation de la connexion mock");
        
        return new class {
            private $lastInsertId = 0;
            private $inMemoryData = [];
            
            public function __construct() {
                // Initialiser avec des données de démonstration
                $this->initDemoData();
            }
            
            private function initDemoData() {
                $this->inMemoryData = [
                    [
                        'id' => 1,
                        'name' => 'Ahmed Ben Salah',
                        'email' => 'ahmed@example.com',
                        'phone' => '+216 12 345 678',
                        'subject' => 'Demande de devis site web',
                        'message' => 'Bonjour, je souhaite obtenir un devis pour la création de mon site e-commerce.',
                        'status' => 'new',
                        'created_at' => date('Y-m-d H:i:s', strtotime('-2 hours')),
                        'email_sent' => true
                    ],
                    [
                        'id' => 2,
                        'name' => 'Marie Dupont',
                        'email' => 'marie@entreprise.com',
                        'phone' => '+33 1 23 45 67 89',
                        'subject' => 'Projet application mobile',
                        'message' => 'Nous cherchons une agence pour développer une application iOS et Android pour notre restaurant.',
                        'status' => 'read',
                        'created_at' => date('Y-m-d H:i:s', strtotime('-1 day')),
                        'email_sent' => true
                    ],
                    [
                        'id' => 3,
                        'name' => 'Mohamed Ali',
                        'email' => 'mohamed@example.com',
                        'phone' => '+216 98 765 432',
                        'subject' => 'Question référencement',
                        'message' => 'Comment pouvez-vous améliorer le référencement de mon site actuel? J\'ai besoin d\'un audit SEO.',
                        'status' => 'replied',
                        'created_at' => date('Y-m-d H:i:s', strtotime('-3 days')),
                        'email_sent' => true
                    ]
                ];
                $this->lastInsertId = 3;
            }
            
            public function prepare($sql) {
                return new class($sql, $this) {
                    private $sql;
                    private $parent;
                    private $boundValues = [];
                    private $boundParams = [];
                    
                    public function __construct($sql, $parent) {
                        $this->sql = $sql;
                        $this->parent = $parent;
                    }
                    
                    public function bindParam($param, &$value, $type = null) {
                        $this->boundParams[$param] = &$value;
                        return $this;
                    }
                    
                    public function bindValue($param, $value, $type = null) {
                        $this->boundValues[$param] = $value;
                        return $this;
                    }
                    
                    public function execute($params = null) {
                        if ($params) {
                            $this->boundValues = array_merge($this->boundValues, $params);
                        }
                        
                        // Log pour débogage
                        error_log("[MOCK SQL] " . $this->sql);
                        error_log("[MOCK PARAMS] " . json_encode($this->boundValues));
                        
                        return true;
                    }
                    
                    public function fetch($fetchStyle = PDO::FETCH_ASSOC) {
                        // Simuler fetch() pour SELECT
                        if (strpos($this->sql, 'SELECT') !== false) {
                            $data = $this->parent->getMockData();
                            return $data[0] ?? false;
                        }
                        return false;
                    }
                    
                    public function fetchAll($fetchStyle = PDO::FETCH_ASSOC) {
                        // Simuler fetchAll() pour SELECT
                        if (strpos($this->sql, 'SELECT') !== false) {
                            return $this->parent->getMockData();
                        }
                        
                        // Pour COUNT
                        if (strpos($this->sql, 'COUNT') !== false) {
                            return [['total' => count($this->parent->getMockData())]];
                        }
                        
                        return [];
                    }
                    
                    public function rowCount() {
                        // Simuler le nombre de lignes affectées
                        if (strpos($this->sql, 'INSERT') !== false) return 1;
                        if (strpos($this->sql, 'UPDATE') !== false) return 1;
                        if (strpos($this->sql, 'DELETE') !== false) return 1;
                        return 0;
                    }
                    
                    public function errorInfo() {
                        return [null, null, null];
                    }
                };
            }
            
            public function query($sql) {
                return $this->prepare($sql);
            }
            
            public function lastInsertId() {
                return ++$this->lastInsertId;
            }
            
            public function getMockData() {
                return $this->inMemoryData;
            }
            
            // Méthode pour ajouter des données mock
            public function addMockData($data) {
                $newId = count($this->inMemoryData) + 1;
                $data['id'] = $newId;
                $data['created_at'] = date('Y-m-d H:i:s');
                $this->inMemoryData[] = $data;
                $this->lastInsertId = $newId;
                return $newId;
            }
            
            // Méthode pour simuler UPDATE
            public function updateMockData($id, $updates) {
                foreach ($this->inMemoryData as &$item) {
                    if ($item['id'] == $id) {
                        $item = array_merge($item, $updates);
                        return true;
                    }
                }
                return false;
            }
            
            // Méthode pour simuler DELETE
            public function deleteMockData($id) {
                $this->inMemoryData = array_filter($this->inMemoryData, function($item) use ($id) {
                    return $item['id'] != $id;
                });
                return true;
            }
        };
    }
}
?>