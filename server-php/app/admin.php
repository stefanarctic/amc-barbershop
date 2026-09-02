<?php
// ============================================================
// /admin — pagină de login + dashboard programări (server-rendered).
// Login-ul NU mai e în JS: formular POST clasic, parola verificată pe
// server cu password_verify, sesiune regenerată la autentificare.
// ============================================================

declare(strict_types=1);
require __DIR__ . '/init.php';
security_headers();

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
// logout prin query (?action=logout) SAU prin path (/admin/logout — routerul duce
// ambele aici; fără asta, un POST pe /admin/logout ajunge la handler-ul de login)
$isLogout = $action === 'logout'
    || parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) === '/admin/logout';

// ---------- deconectare: POST /admin?action=logout sau POST /admin/logout ----------
// CSRF verificat, dar fără JSON: dacă tokenul nu se potrivește (ex: sesiune
// expirată), pur și simplu redirectionăm la login în loc de eroare brută.
if ($isLogout && $method === 'POST') {
    $t = $_POST['csrf'] ?? null;
    if (is_string($t) && !empty($_SESSION['csrf']) && hash_equals($_SESSION['csrf'], $t)) {
        $_SESSION = [];
        session_destroy();
    }
    header('Location: /admin');
    exit;
}

// ---------- autentificare: POST /admin ----------
// La eșec NU întoarcem JSON (formularul e POST clasic) — re-randăm pagina
// de login cu mesaj de eroare prietenos, prin $loginError.
$loginError = '';
if ($method === 'POST') {
    // TEMP diagnostic: logăm fiecare POST ca să urmărim exact ce trimite browserul
    error_log("admin POST diag: URI='{$_SERVER['REQUEST_URI']}' Origin='" . ($_SERVER['HTTP_ORIGIN'] ?? '(fără)') . "' Host='" . ($_SERVER['HTTP_HOST'] ?? '?') . "' IP=" . client_ip());
    $t = $_POST['csrf'] ?? null;
    if (!same_origin()) {
        $loginError = 'Origine nepermisă.';
    } elseif (!is_string($t) || empty($_SESSION['csrf']) || !hash_equals($_SESSION['csrf'], $t)) {
        // token dezacordat (de obicei cookie vechi dintr-o sesiune anterioară):
        // regenerăm tokenul și re-randăm login-ul — se auto-vindecă la următorul submit
        unset($_SESSION['csrf']);
        $loginError = 'Reîncearcă — pagina s-a reîmprospătat.';
    } else {
        if (!rate_check('login', client_ip(), 15 * 60, 5)) {
            $loginError = 'Prea multe încercări. Reîncearcă în 15 minute.';
        } else {
            $password = (string) ($_POST['password'] ?? '');
            $st = db()->prepare('SELECT id, password_hash FROM admins WHERE username = ?');
            $st->execute(['admin']);
            $admin = $st->fetch();

            $ok = false;
            if ($admin && $password !== '') {
                $ok = password_verify($password, $admin['password_hash']);
            }
            if (!$ok) {
                $noAdminHint = $admin ? '' : ' (Tabela admins e goală — rulează: php server-php/bin/setpass.php PAROLA)';
                rate_hit('login', client_ip());
                // pauză identică indiferent dacă adminul există — nimic de enumerat
                usleep(random_int(30000, 80000));
                $loginError = 'Date de autentificare greșite.' . $noAdminHint;
            } else {
                // anti session-fixation: id NOU după login, și token CSRF nou
                // (cel dinainte de login nu trebuie să supraviețuiască autentificării)
                session_regenerate_id(true);
                $_SESSION['csrf'] = bin2hex(random_bytes(32));
                $_SESSION['admin_id'] = (int) $admin['id'];
                $_SESSION['admin_since'] = time();
                header('Location: /admin');
                exit;
            }
        }
    }
}

// ---------- afișare (GET) ----------
$csrf = csrf_token();
if (admin_logged_in()) {
    // sesiunile mai vechi de 8h mor aici (gc_maxlifetime poate fi rescris de hosting)
    if ((time() - (int) ($_SESSION['admin_since'] ?? time())) > SESSION_TTL) {
        $_SESSION = [];
        session_destroy();
        header('Location: /admin');
        exit;
    }
    $pageTitle = 'Dashboard programări';
    require __DIR__ . '/views/dash.php';
} else {
    $pageTitle = 'Autentificare';
    require __DIR__ . '/views/login.php';
}
