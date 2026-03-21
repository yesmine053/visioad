<?php
// Backend/models/Contact.php

class Contact {

    private PDO    $pdo;
    private string $table = 'contacts';

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    // ── Créer un message de contact ───────────────────────────────────────────
    public function create(array $data): int {
        $stmt = $this->pdo->prepare("
            INSERT INTO {$this->table} (name, email, phone, subject, message, status, created_at)
            VALUES (:name, :email, :phone, :subject, :message, 'new', NOW())
        ");
        $stmt->execute([
            ':name'    => $this->sanitize($data['name']),
            ':email'   => filter_var($data['email'], FILTER_SANITIZE_EMAIL),
            ':phone'   => $this->sanitize($data['phone']   ?? ''),
            ':subject' => $this->sanitize($data['subject'] ?? ''),
            ':message' => $this->sanitize($data['message']),
        ]);
        return (int)$this->pdo->lastInsertId();
    }

    // ── Lister tous les messages ──────────────────────────────────────────────
    public function findAll(): array {
        return $this->pdo
            ->query("SELECT * FROM {$this->table} ORDER BY created_at DESC")
            ->fetchAll(PDO::FETCH_ASSOC);
    }

    // ── Trouver par ID ────────────────────────────────────────────────────────
    public function findById(int $id): ?array {
        $stmt = $this->pdo->prepare("SELECT * FROM {$this->table} WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch() ?: null;
    }

    // ── Changer le statut ─────────────────────────────────────────────────────
    public function updateStatus(int $id, string $status): bool {
        $allowed = ['new', 'read', 'replied'];
        if (!in_array($status, $allowed)) return false;

        $stmt = $this->pdo->prepare("UPDATE {$this->table} SET status = :s WHERE id = :id");
        return $stmt->execute([':s' => $status, ':id' => $id]);
    }

    // ── Supprimer ─────────────────────────────────────────────────────────────
    public function delete(int $id): bool {
        $stmt = $this->pdo->prepare("DELETE FROM {$this->table} WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }

    // ── Statistiques ─────────────────────────────────────────────────────────
    public function stats(): array {
        $row = $this->pdo->query("
            SELECT
                COUNT(*) AS total,
                SUM(status = 'new')     AS new_count,
                SUM(status = 'read')    AS read_count,
                SUM(status = 'replied') AS replied_count,
                SUM(DATE(created_at) = CURDATE()) AS today
            FROM {$this->table}
        ")->fetch(PDO::FETCH_ASSOC);

        return [
            'total'   => (int)$row['total'],
            'new'     => (int)$row['new_count'],
            'read'    => (int)$row['read_count'],
            'replied' => (int)$row['replied_count'],
            'today'   => (int)$row['today'],
        ];
    }

    // ── Nettoyage ─────────────────────────────────────────────────────────────
    private function sanitize(string $value): string {
        return htmlspecialchars(strip_tags(trim($value)));
    }
}
?>