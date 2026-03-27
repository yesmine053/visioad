<?php
// ── Headers CORS ──────────────────────────────────────────────────────────────
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

// ── Connexion DB ──────────────────────────────────────────────────────────────
try {
    $db = new PDO('mysql:host=localhost;dbname=visioad_db;charset=utf8mb4', 'root', '');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'DB: ' . $e->getMessage()]);
    exit;
}

// ── Vérifier token admin ──────────────────────────────────────────────────────
$headers = getallheaders();
$auth    = $headers['Authorization'] ?? '';
$token   = str_replace('Bearer ', '', $auth);
$payload = $token ? json_decode(base64_decode($token), true) : null;

if (!$payload || ($payload['role'] ?? '') !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Accès refusé']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

// ════════════════════════════════════════════════════════════════════════════
// GET  — liste des utilisateurs avec pagination
// ════════════════════════════════════════════════════════════════════════════
if ($method === 'GET') {
    $page  = max(1, intval($_GET['page']  ?? 1));
    $limit = max(1, intval($_GET['limit'] ?? 10));
    $role  = $_GET['role'] ?? '';
    $offset = ($page - 1) * $limit;

    // ── Détecter quelles colonnes existent dans la table users ───────────────
    $cols = [];
    $colStmt = $db->query("SHOW COLUMNS FROM users");
    foreach ($colStmt->fetchAll(PDO::FETCH_ASSOC) as $col) {
        $cols[] = $col['Field'];
    }

    // Colonnes toujours présentes
    $select = 'id, username, email, role, created_at';

    // Colonnes optionnelles — ajoutées seulement si elles existent
    if (in_array('status',     $cols)) $select .= ', status';
    if (in_array('verified',   $cols)) $select .= ', verified';
    if (in_array('last_login', $cols)) $select .= ', last_login';

    // Count total
    $whereRole = $role ? 'WHERE role = :role' : '';
    $countStmt = $db->prepare("SELECT COUNT(*) FROM users $whereRole");
    if ($role) $countStmt->bindValue(':role', $role);
    $countStmt->execute();
    $total = (int)$countStmt->fetchColumn();
    $pages = max(1, ceil($total / $limit));

    // Données
    $sql  = "SELECT $select FROM users $whereRole ORDER BY created_at DESC LIMIT :lim OFFSET :off";
    $stmt = $db->prepare($sql);
    if ($role) $stmt->bindValue(':role', $role);
    $stmt->bindValue(':lim',  $limit,  PDO::PARAM_INT);
    $stmt->bindValue(':off',  $offset, PDO::PARAM_INT);
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // ── Normaliser les valeurs ────────────────────────────────────────────────
    foreach ($users as &$u) {
        // verified : convertir 0/1 en booléen, ou déduire du rôle si absent
        if (array_key_exists('verified', $u)) {
            $u['verified'] = (bool)$u['verified'];
        } else {
            $u['verified'] = ($u['role'] === 'admin');
        }

        // status : valeur par défaut 'active' si absent
        if (!array_key_exists('status', $u) || !$u['status']) {
            $u['status'] = 'active';
        }

        // last_login : null → null (pas de chaîne vide)
        if (array_key_exists('last_login', $u)) {
            $u['last_login'] = $u['last_login'] ?: null;
        } else {
            $u['last_login'] = null;
        }

        // Supprimer le mot de passe par sécurité
        unset($u['password']);
    }
    unset($u);

    echo json_encode([
        'success'    => true,
        'users'      => $users,
        'pagination' => ['total' => $total, 'page' => $page, 'limit' => $limit, 'pages' => $pages],
    ]);
    exit;
}

// ════════════════════════════════════════════════════════════════════════════
// DELETE  — supprimer un utilisateur
// ════════════════════════════════════════════════════════════════════════════
if ($method === 'DELETE') {
    $id = intval($_GET['id'] ?? 0);

    // Empêcher de supprimer son propre compte
    if ($id === intval($payload['id'] ?? 0)) {
        echo json_encode(['success' => false, 'message' => 'Vous ne pouvez pas supprimer votre propre compte.']);
        exit;
    }

    if (!$id) {
        echo json_encode(['success' => false, 'message' => 'ID manquant']);
        exit;
    }

    $db->prepare('DELETE FROM users WHERE id = :id')->execute([':id' => $id]);
    echo json_encode(['success' => true, 'message' => 'Utilisateur supprimé.']);
    exit;
}

echo json_encode(['success' => false, 'message' => 'Méthode non supportée']);