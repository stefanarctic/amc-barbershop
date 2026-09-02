<?php
// ============================================================
// Bootstrap comun: DB (SQLite/PDO), sesiune, securitate, helpers.
// Inclus de router prin app/admin.php și app/api.php.
//
// Securitate (pe scurt):
//  - SQL: EXCLUSIV prepared statements (PDO) — imun la SQL injection
//  - parolă: password_hash (Argon2id/Bcrypt), niciodată în clar
//  - sesiune: cookie HttpOnly + SameSite=Strict, use_strict_mode,
//             regenerate_id la login (anti-fixation)
//  - CSRF: token pe sesiune, verificat la orice POST/DELETE
//  - rate limiting în DB (login 5/15min, programări 5/10min)
//  - headere de securitate pe fiecare răspuns
//  - jurnal de audit la ștergeri
// ============================================================

declare(strict_types=1);

error_reporting(E_ALL);
ini_set('display_errors', '0'); // niciodată detalii de eroare către vizitatori
ini_set('log_errors', '1');

define('APP_ROOT', dirname(__DIR__));                 // server-php/
define('PROJECT_ROOT', dirname(APP_ROOT));            // rădăcina proiectului
define('DATA_DIR', APP_ROOT . '/data');
define('DB_FILE', DATA_DIR . '/amc.db');
define('ERROR_LOG', DATA_DIR . '/php-errors.log');

// nu @mkdir — dacă eșuează vrem o eroare clară, nu un „could not open database" misterios
if (!is_dir(DATA_DIR) && !mkdir(DATA_DIR, 0770, true) && !is_dir(DATA_DIR)) {
    http_response_code(500);
    exit('Serverul nu își poate crea directorul de date. Verifică permisiunile pentru ' . DATA_DIR);
}
ini_set('error_log', ERROR_LOG);

// ---------- fus orar: frizeria e în România ----------
date_default_timezone_set('Europe/Bucharest');
define('TZ', 'Europe/Bucharest'); // folosită în validate_booking (DateTimeZone)

// ---------- programul frizeriei (ȚINUT SINCRON cu SCHEDULE din script.js) ----------
// jsDay = ziua din JS (getDay): 0=duminică … 6=sâmbătă
const SCHEDULE = [
    ['jsDay' => 1, 'closed' => false, 'open' => '10:00', 'close' => '20:00'],
    ['jsDay' => 2, 'closed' => false, 'open' => '10:00', 'close' => '20:00'],
    ['jsDay' => 3, 'closed' => false, 'open' => '10:00', 'close' => '20:00'],
    ['jsDay' => 4, 'closed' => false, 'open' => '10:00', 'close' => '20:00'],
    ['jsDay' => 5, 'closed' => false, 'open' => '10:00', 'close' => '20:00'],
    ['jsDay' => 6, 'closed' => false, 'open' => '10:30', 'close' => '16:00'],
    ['jsDay' => 0, 'closed' => true],
];
const SLOT_MIN = 30;

// Duratele serviciilor (minute) — ȚINUT SINCRON cu SERVICES din script.js
const SERVICE_DURATIONS = [
    'Tuns modern + Aranjat + Spălat' => 45,
    'Tuns modern + Barbă + Aranjat + Spălat' => 60,
    'Barbă' => 30,
    'Pachet Tuns modern + Hairdesign' => 50,
    'Spălat + Aranjat freză bărbați' => 10,
];
const DEFAULT_DURATION = 30;

const SESSION_TTL = 8 * 60 * 60; // 8 ore
const RE_PHONE = '/^0\d{9}$/';
const RE_DATE = '/^\d{4}-\d{2}-\d{2}$/';
const RE_TIME = '/^\d{2}:\d{2}$/';

// ---------- sesiune întărită ----------
if (session_status() === PHP_SESSION_NONE) {
    $secure = is_https();
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'httponly' => true,
        'samesite' => 'Strict',
        'secure' => $secure,
    ]);
    ini_set('session.use_strict_mode', '1');
    ini_set('session.gc_maxlifetime', (string) SESSION_TTL);
    // nu depindem de interpolarea ${DATA_DIR} din php.ini — setăm explicit
    ini_set('session.save_path', DATA_DIR . '/sessions');
    if (!is_dir(DATA_DIR . '/sessions')) @mkdir(DATA_DIR . '/sessions', 0770, true);
    session_name('lm_admin_sess');
    session_start();
}

// ---------- DB (SQLite + PDO, WAL) ----------
function db(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $pdo = new PDO('sqlite:' . DB_FILE, null, null, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
        $pdo->exec('PRAGMA journal_mode = WAL');
        $pdo->exec('PRAGMA foreign_keys = ON');
        $pdo->exec('PRAGMA busy_timeout = 5000');
        db_migrate($pdo);
    }
    return $pdo;
}

function db_migrate(PDO $pdo): void
{
    $pdo->exec('CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL
    )');
    $pdo->exec('CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        service TEXT NOT NULL,
        specialist TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        duration INTEGER NOT NULL DEFAULT 30,
        cancel_token TEXT NOT NULL,
        created_at TEXT NOT NULL
    )');
    $pdo->exec('CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings (date)');
    $pdo->exec('CREATE INDEX IF NOT EXISTS idx_bookings_phone ON bookings (phone)');
    $pdo->exec('CREATE TABLE IF NOT EXISTS login_attempts (
        ip TEXT NOT NULL,
        ts INTEGER NOT NULL
    )');
    $pdo->exec('CREATE INDEX IF NOT EXISTS idx_attempts ON login_attempts (ip, ts)');
    $pdo->exec('CREATE TABLE IF NOT EXISTS audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ts TEXT NOT NULL,
        action TEXT NOT NULL,
        ip TEXT NOT NULL,
        details TEXT NOT NULL
    )');
}

// ---------- headere de securitate (pe fiecare răspuns) ----------
function security_headers(): void
{
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('Referrer-Policy: no-referrer');
    header('Permissions-Policy: camera=(), microphone=(), geolocation=()');
    // CSP strict: scripturi doar din propriul site, nimic inline/injectat
    header("Content-Security-Policy: default-src 'self'; img-src 'self' data:; style-src 'self'; frame-ancestors 'none'; base-uri 'none'");
    if (is_https()) {
        header('Strict-Transport-Security: max-age=31536000');
    }
}

function is_https(): bool
{
    // în spatele unui proxy de încredere (nginx) — TRUST_PROXY=1
    if (getenv('TRUST_PROXY') === '1' && ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') !== '') {
        return strtolower(trim(explode(',', (string) $_SERVER['HTTP_X_FORWARDED_PROTO'])[0])) === 'https';
    }
    return ($_SERVER['HTTPS'] ?? '') !== '' && ($_SERVER['HTTPS'] ?? '') !== 'off';
}

function client_ip(): string
{
    // În spatele unui proxy de ÎNCREDERE (TRUST_PROXY=1) luăm ULTIMUL element din
    // X-Forwarded-For — e singurul adăugat de proxy-ul nostru; primele elemente
    // sunt controlate de client (spoofing → rate limiting ocolibil).nginx trebuie
    // să facă `proxy_set_header X-Forwarded-For $remote_addr;` (suprascrie, nu appendă).
    if (getenv('TRUST_PROXY') === '1' && ($_SERVER['HTTP_X_FORWARDED_FOR'] ?? '') !== '') {
        $parts = explode(',', trim((string) $_SERVER['HTTP_X_FORWARDED_FOR']));
        $candidate = trim(end($parts));
        if (filter_var($candidate, FILTER_VALIDATE_IP) !== false) return $candidate;
    }
    return (string) ($_SERVER['REMOTE_ADDR'] ?? '?');
}

// ---------- răspunsuri JSON ----------
function json_out(int $status, array $data, array $headers = []): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    foreach ($headers as $h => $v) header("$h: $v");
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function read_json_body(int $limit = 10240): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || strlen($raw) > $limit) json_out(400, ['error' => 'Cerere invalidă.']);
    if (trim($raw) === '') return [];
    $data = json_decode($raw, true);
    if (!is_array($data)) json_out(400, ['error' => 'JSON invalid.']);
    return $data;
}

// ---------- CSRF ----------
function csrf_token(): string
{
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}

function csrf_check(?string $token): void
{
    if (!is_string($token) || empty($_SESSION['csrf']) || !hash_equals($_SESSION['csrf'], $token)) {
        json_out(403, ['error' => 'Token de securitate invalid. Reîncarcă pagina.']);
    }
}

// cereri care modifică date: Origin (dacă există) trebuie să fie al nostru (anti-CSRF extra)
function same_origin(): bool
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin === '') return true; // cereri non-browser; autentificarea/CSRF rămân obligatorii
    // Origin: null e trimis legitim de unele browsere/configurări (redirecte, extensii
    // de privacy, contexte opace). Tokenul CSRF rămâne bariera principală — un atacator
    // cross-origin nu poate citi tokenul, deci nu poate exploata această laxitate.
    if (strtolower($origin) === 'null') return true;
    $host = $_SERVER['HTTP_HOST'] ?? '';
    if ($host === '') return false;
    $p = parse_url($origin);
    $originScheme = strtolower($p['scheme'] ?? '');
    if ($originScheme !== 'http' && $originScheme !== 'https') return false;
    // comparăm DOAR hostul (fără port/schemă): portul poate diferi legitime
    // (proxy, localhost cu alt port). Tokenul CSRF rămâne bariera principală.
    $originHost = strtolower($p['host'] ?? '');
    $reqHost = strtolower(explode(':', trim($host, '[]'), 2)[0]);
    // localhost, 127.0.0.1 și [::1] sunt același server — browserul trimite oricare
    // în Origin, în funcție de cum a fost deschisă pagina (bookmarks, istoric etc.)
    $loopback = ['localhost', '127.0.0.1', '::1', '[::1]'];
    if (in_array($originHost, $loopback, true) && in_array($reqHost, $loopback, true)) {
        $ok = true;
    } else {
        $ok = $originHost !== '' && $originHost === $reqHost;
    }
    if (!$ok) {
        error_log("same_origin refuzat: Origin='$origin' Host='$host' IP=" . client_ip());
    }
    return $ok;
}

// ---------- autentificare admin ----------
function admin_logged_in(): bool
{
    return !empty($_SESSION['admin_id']);
}

function require_admin(): void
{
    if (!admin_logged_in()) {
        json_out(401, ['error' => 'Neautentificat.']);
    }
}

// ---------- rate limiting în DB ----------
function rate_check(string $name, string $ip, int $windowSec, int $max): bool
{
    $pdo = db();
    $pdo->exec('DELETE FROM login_attempts WHERE ts < ' . (time() - max($windowSec, 3600) * 24));
    $st = $pdo->prepare('SELECT COUNT(*) c FROM login_attempts WHERE ip = ? AND ts > ?');
    $st->execute([$name . '|' . $ip, time() - $windowSec]);
    return ((int) $st->fetch()['c']) < $max;
}

function rate_hit(string $name, string $ip): void
{
    $st = db()->prepare('INSERT INTO login_attempts (ip, ts) VALUES (?, ?)');
    $st->execute([$name . '|' . $ip, time()]);
}

// ---------- audit ----------
function audit(string $action, array $details): void
{
    $st = db()->prepare('INSERT INTO audit_log (ts, action, ip, details) VALUES (?, ?, ?, ?)');
    $st->execute([gmdate('c'), $action, client_ip(), json_encode($details, JSON_UNESCAPED_UNICODE)]);
}

// ---------- validare programare (aceeași logică ca în server.js) ----------
function to_minutes(string $t): int
{
    [$h, $m] = array_map('intval', explode(':', $t));
    return $h * 60 + $m;
}

function day_of_week(string $date): int
{
    // 0 = duminică (ca în JS getDay)
    return (int) DateTime::createFromFormat('!Y-m-d', $date)->format('w');
}

function clean_str(mixed $s, int $max): string
{
    return mb_substr(trim((string) ($s ?? '')), 0, $max);
}

function validate_booking(array $body): array
{
    $name = clean_str($body['name'] ?? '', 80);
    $phone = str_replace(' ', '', clean_str($body['phone'] ?? '', 16));
    $service = clean_str($body['service'] ?? '', 80);
    $specialist = clean_str($body['specialist'] ?? '', 80);
    $date = clean_str($body['date'] ?? '', 10);
    $time = clean_str($body['time'] ?? '', 5);

    if (mb_strlen($name) < 2) return ['error' => 'Nume invalid.'];
    if (!preg_match(RE_PHONE, $phone)) return ['error' => 'Număr de telefon invalid (ex: 0722123456).'];
    if ($service === '') return ['error' => 'Alege un serviciu.'];
    if ($specialist === '') return ['error' => 'Alege un specialist.'];
    if (!preg_match(RE_DATE, $date)) return ['error' => 'Dată invalidă.'];
    // createFromFormat „rotește" datele invalide (2026-02-30 → 2026-03-02) — comparăm
    // data re-parsată cu cea cerută ca să respingem zile care nu există
    $dt = DateTime::createFromFormat('!Y-m-d', $date);
    if ($dt === false || $dt->format('Y-m-d') !== $date) return ['error' => 'Dată invalidă.'];
    if (!preg_match(RE_TIME, $time)) return ['error' => 'Oră invalidă.'];
    $tMins = to_minutes($time);
    if ($tMins % SLOT_MIN !== 0) return ['error' => 'Ora trebuie să fie pe interval de 30 de minute.'];

    $now = new DateTime('now', new DateTimeZone(TZ));
    $today = $now->format('Y-m-d');
    $nowMins = (int) $now->format('H') * 60 + (int) $now->format('i');
    if ($date < $today) return ['error' => 'Nu poți programa în trecut.'];

    $entry = null;
    foreach (SCHEDULE as $s) if ($s['jsDay'] === day_of_week($date)) $entry = $s;
    if ($entry === null || $entry['closed']) return ['error' => 'Frizeria este închisă în această zi.'];
    $dur = SERVICE_DURATIONS[$service] ?? DEFAULT_DURATION;
    if ($tMins < to_minutes($entry['open']) || $tMins + $dur > to_minutes($entry['close']))
        return ['error' => 'Ora este în afara programului.'];
    if ($date === $today && $tMins <= $nowMins) return ['error' => 'Ora este în trecut.'];

    return ['booking' => ['name' => $name, 'phone' => $phone, 'service' => $service,
        'specialist' => $specialist, 'date' => $date, 'time' => $time], 'duration' => $dur];
}
