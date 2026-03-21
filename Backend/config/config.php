<?php
// Backend/config/config.php
// ⚠️  Les valeurs sensibles sont lues depuis Backend/.env
//     Créez .env à partir de .env.example et ne le commitez JAMAIS dans Git.

final class Config {

    const APP_NAME    = 'VisioAD';
    const APP_VERSION = '1.0.0';
    const DEBUG_MODE  = false; // true uniquement en développement local

    // ── URLs ──────────────────────────────────────────────────────────────────
    const BASE_URL     = 'http://localhost:8089/visioad/backend';
    const FRONTEND_URL = 'http://localhost:3000';

    // ── JWT ───────────────────────────────────────────────────────────────────
    // Clé lue depuis .env — ne jamais écrire la vraie clé ici
    const JWT_EXPIRE  = 604800; // 7 jours en secondes

    public static function jwtSecret(): string {
        return self::env('JWT_SECRET', 'changez_cette_cle_en_production_32chars');
    }

    // ── SMTP ──────────────────────────────────────────────────────────────────
    const SMTP_HOST = 'smtp.gmail.com';
    const SMTP_PORT = 587;

    public static function smtpUser(): string  { return self::env('SMTP_USER',  ''); }
    public static function smtpPass(): string  { return self::env('SMTP_PASS',  ''); }
    public static function adminEmail(): string { return self::env('ADMIN_EMAIL', ''); }

    // ── Lecture .env ──────────────────────────────────────────────────────────
    private static bool $loaded = false;

    private static function env(string $key, string $default = ''): string {
        if (!self::$loaded) {
            $envFile = __DIR__ . '/../.env'; // Backend/.env
            if (file_exists($envFile)) {
                foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
                    if (str_starts_with(trim($line), '#')) continue;
                    [$k, $v] = array_map('trim', explode('=', $line, 2) + ['', '']);
                    if ($k && !isset($_ENV[$k])) $_ENV[$k] = $v;
                }
            }
            self::$loaded = true;
        }
        return $_ENV[$key] ?? getenv($key) ?: $default;
    }

    // Empêche l'instanciation
    private function __construct() {}
}
?>