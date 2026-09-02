<?php
// ============================================================
// Setează/schimbă parola de admin (doar din linia de comandă!):
//   php server-php/bin/setpass.php "PAROLA_TA"
// Parola e stocată DOAR ca hash Argon2id (sau Bcrypt) cu salt.
// ============================================================

declare(strict_types=1);
if (PHP_SAPI !== 'cli') exit("Doar din linia de comandă.\n");

// php.ini folosește ${PROJECT_DIR}/${DATA_DIR} — fără ele, interpolarea e silentios
// goală și scriptul crapă criptic. Avertizăm clar înainte.
foreach (['PROJECT_DIR', 'DATA_DIR'] as $envVar) {
    if (getenv($envVar) === false) {
        fwrite(STDERR, "❌ Variabila de mediu $envVar lipsește. Rulează:\n");
        fwrite(STDERR, "   export PROJECT_DIR=\"\$(pwd)\" DATA_DIR=\"\$(pwd)/server-php/data\"\n");
        fwrite(STDERR, "   php -c server-php/php.ini server-php/bin/setpass.php \"PAROLA\"\n");
        exit(1);
    }
}

require dirname(__DIR__) . '/app/init.php';

$password = (string) ($argv[1] ?? '');
if (strlen($password) < 8) {
    fwrite(STDERR, "Parola trebuie să aibă cel puțin 8 caractere.\n");
    exit(1);
}

// Argon2id dacă e disponibil, altfel Bcrypt — ambele sunt rezistente la forță brută
$algo = defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_BCRYPT;
$hash = password_hash($password, $algo);

$pdo = db();
$st = $pdo->prepare('SELECT id FROM admins WHERE username = ?');
$st->execute(['admin']);
if ($st->fetch()) {
    $pdo->prepare('UPDATE admins SET password_hash = ? WHERE username = ?')
        ->execute([$hash, 'admin']);
    echo "✅ Parolă de admin actualizată.\n";
} else {
    $pdo->prepare('INSERT INTO admins (username, password_hash, created_at) VALUES (?, ?, ?)')
        ->execute(['admin', $hash, gmdate('c')]);
    echo "✅ Admin creat, parolă setată.\n";
}
echo "Algoritm: " . ($algo === PASSWORD_ARGON2ID ? 'Argon2id' : 'Bcrypt') . "\n";
