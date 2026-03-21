<?php
// Backend/api/contact.php

header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, Accept');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../models/Contact.php';

class EmailService {
    private function createMailer(): object {
        require_once __DIR__ . '/../includes/PHPMailer/src/Exception.php';
        require_once __DIR__ . '/../includes/PHPMailer/src/PHPMailer.php';
        require_once __DIR__ . '/../includes/PHPMailer/src/SMTP.php';
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        $mail->isSMTP();
        $mail->Host       = Config::SMTP_HOST;
        $mail->SMTPAuth   = true;
        $mail->Username   = Config::smtpUser();   // ✅ depuis .env
        $mail->Password   = Config::smtpPass();   // ✅ depuis .env
        $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = Config::SMTP_PORT;
        $mail->CharSet    = 'UTF-8';
        // verify_peer activé — certificat Gmail valide en production
        // Décommentez la ligne suivante UNIQUEMENT si vous êtes en développement local avec XAMPP :
        // $mail->SMTPOptions = ['ssl' => ['verify_peer' => false, 'verify_peer_name' => false, 'allow_self_signed' => true]];
        $mail->setFrom(Config::smtpUser(), 'VisioAD Contact Form');
        return $mail;
    }
    public function sendToAdmin(array $data, int $contactId): bool {
        try {
            $mail = $this->createMailer();
            $mail->addAddress(Config::adminEmail(), 'VisioAD Team'); // ✅ depuis .env
            $mail->addReplyTo($data['email'], $data['name']);
            $mail->isHTML(true);
            $mail->Subject = $data['subject'] ?: 'Nouveau message - VisioAD';
            $mail->Body    = $this->buildAdminHtml($data, $contactId);
            $mail->AltBody = "De: {$data['name']} | Email: {$data['email']} | ID: #{$contactId}\n\n{$data['message']}";
            return $mail->send();
        } catch (Exception $e) { error_log('[EMAIL ADMIN] ' . $e->getMessage()); return false; }
    }
    public function sendConfirmation(string $name, string $email, int $id): bool {
        try {
            $mail = $this->createMailer();
            $mail->addAddress($email, $name);
            $mail->isHTML(true);
            $mail->Subject = 'Confirmation - VisioAD';
            $n = htmlspecialchars($name);
            $mail->Body = "<div style='font-family:Arial;padding:20px'><h2 style='color:#d12127'>Message reçu !</h2>
                <p>Cher(e) <strong>{$n}</strong>, merci de nous avoir contactés.</p>
                <p>Référence : <strong>#{$id}</strong> — Réponse sous 24h.</p>
                <p style='color:#d12127'><strong>L'équipe VisioAD</strong></p></div>";
            $mail->AltBody = "Cher(e) {$name}, votre message #{$id} a été reçu. Réponse sous 24h.";
            return $mail->send();
        } catch (Exception $e) { error_log('[EMAIL CONFIRM] ' . $e->getMessage()); return false; }
    }
    private function buildAdminHtml(array $d, int $id): string {
        $n = htmlspecialchars($d['name']); $e = htmlspecialchars($d['email']);
        $p = htmlspecialchars($d['phone'] ?? ''); $s = htmlspecialchars($d['subject'] ?? '');
        $m = nl2br(htmlspecialchars($d['message']));
        return "<div style='font-family:Arial'>
            <div style='background:#d12127;color:#fff;padding:20px;text-align:center'><h1>Nouveau message contact</h1></div>
            <div style='background:#f9f9f9;padding:30px;border:1px solid #ddd'>
            <p><b style='color:#d12127'>Nom :</b> {$n}</p><p><b style='color:#d12127'>Email :</b> {$e}</p>"
            . ($p ? "<p><b style='color:#d12127'>Tél :</b> {$p}</p>" : '')
            . ($s ? "<p><b style='color:#d12127'>Sujet :</b> {$s}</p>" : '')
            . "<p><b style='color:#d12127'>ID :</b> #{$id}</p>
            <div style='background:#fff;padding:20px;border-left:4px solid #d12127;margin:20px 0'>{$m}</div>
            </div></div>";
    }
}

class ContactController {
    private Contact $model;
    private EmailService $mailer;
    public function __construct(PDO $pdo) { $this->model = new Contact($pdo); $this->mailer = new EmailService(); }
    private function json(array $data, int $code = 200): void { http_response_code($code); echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT); exit(); }
    private function body(): array { return json_decode(file_get_contents('php://input'), true) ?? []; }
    public function store(): void {
        $data = $this->body();
        foreach (['name','email','message'] as $f) if (empty($data[$f])) $this->json(['success'=>false,'message'=>"Champ '{$f}' requis"],400);
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) $this->json(['success'=>false,'message'=>'Email invalide'],400);
        $id = $this->model->create($data);
        $adminSent = $this->mailer->sendToAdmin($data, $id);
        $confirmSent = $this->mailer->sendConfirmation($data['name'], $data['email'], $id);
        $this->json(['success'=>true,'message'=>'Message envoyé !'.($confirmSent?' Email de confirmation envoyé.':''),'contact_id'=>$id,'email_sent'=>$adminSent,'confirmation_sent'=>$confirmSent]);
    }
    public function index(): void { $m = $this->model->findAll(); $this->json(['success'=>true,'messages'=>$m,'total'=>count($m)]); }
    public function stats(): void { $this->json(['success'=>true,'stats'=>$this->model->stats()]); }
    public function updateStatus(string $status): void {
        $id = (int)($this->body()['id'] ?? 0);
        if (!$id) $this->json(['success'=>false,'message'=>'ID requis'],400);
        $ok = $this->model->updateStatus($id, $status);
        $this->json(['success'=>$ok,'message'=>$ok?"Statut : {$status}":'Non trouvé','id'=>$id]);
    }
    public function destroy(): void {
        $id = (int)($this->body()['id'] ?? 0);
        if (!$id) $this->json(['success'=>false,'message'=>'ID requis'],400);
        $ok = $this->model->delete($id);
        $this->json(['success'=>$ok,'message'=>$ok?'Supprimé':'Non trouvé']);
    }
}

try {
    $pdo = (new Database())->getConnection();
    $ctrl = new ContactController($pdo);
    $method = $_SERVER['REQUEST_METHOD'];
    $action = $_GET['action'] ?? '';
    match (true) {
        $method==='POST'   && $action===''        => $ctrl->store(),
        $method==='GET'    && $action==='list'    => $ctrl->index(),
        $method==='GET'    && $action==='stats'   => $ctrl->stats(),
        $method==='PUT'    && $action==='read'    => $ctrl->updateStatus('read'),
        $method==='PUT'    && $action==='replied' => $ctrl->updateStatus('replied'),
        $method==='DELETE' && $action==='delete'  => $ctrl->destroy(),
        default => (function() use ($method,$action){ http_response_code(404); echo json_encode(['success'=>false,'message'=>"Action '{$action}' non supportée pour {$method}"]); })()
    };
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success'=>false,'message'=>'Erreur serveur : '.$e->getMessage()]);
}
?>