<?php
// Backend/utils/JWT.php

class JWT {

    private string $secret;
    private string $algo = 'HS256';

    public function __construct() {
        $this->secret = $this->loadSecret();
    }

    private function loadSecret(): string {
        // 1. Depuis $_ENV (si Config déjà chargé)
        if (!empty($_ENV['JWT_SECRET'])) return $_ENV['JWT_SECRET'];

        // 2. Depuis getenv()
        $env = getenv('JWT_SECRET');
        if ($env) return $env;

        // 3. Lire .env manuellement
        $envFile = __DIR__ . '/../../.env';
        if (file_exists($envFile)) {
            foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
                if (str_starts_with(trim($line), '#')) continue;
                if (str_contains($line, '=')) {
                    [$key, $val] = array_map('trim', explode('=', $line, 2));
                    if ($key === 'JWT_SECRET' && $val) return $val;
                }
            }
        }

        // 4. Fallback par défaut
        return 'visioad_jwt_secret_key_2026';
    }

    public function encode(array $payload): string {
        $header  = $this->base64url(json_encode(['typ' => 'JWT', 'alg' => $this->algo]));
        $payload = $this->base64url(json_encode($payload));
        $sig     = $this->base64url(hash_hmac('sha256', "{$header}.{$payload}", $this->secret, true));
        return "{$header}.{$payload}.{$sig}";
    }

    public function decode(string $token): ?array {
        $parts = explode('.', $token);
        if (count($parts) !== 3) return null;

        [$header, $payload, $sig] = $parts;
        $expected = $this->base64url(hash_hmac('sha256', "{$header}.{$payload}", $this->secret, true));

        if (!hash_equals($expected, $sig)) return null;

        $data = json_decode($this->base64urlDecode($payload), true);
        if (!$data) return null;

        if (isset($data['exp']) && $data['exp'] < time()) {
            throw new Exception('Token expiré');
        }

        return $data;
    }

    private function base64url(string $data): string {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private function base64urlDecode(string $data): string {
        return base64_decode(
            strtr($data, '-_', '+/') . str_repeat('=', 3 - (3 + strlen($data)) % 4)
        );
    }
}
?>