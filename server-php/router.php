<?php
// ============================================================
// Router pentru serverul PHP integrat (development / VPS simplu):
//   php -c server-php/php.ini -S 0.0.0.0:8462 -t la-macrea server-php/router.php
//
// Roluri:
//  - /admin  → aplicația de administrare (server-php/app/admin.php)
//  - /api/*  → API-ul JSON (server-php/app/api.php)
//  - restul  → fișiere statice din docroot (la-macrea), DOAR pe extensii
//              whitelist — niciun .php din docroot nu se execută vreodată.
//              Astfel, un fișier webshell plantat în docroot este inerțial.
// ============================================================

declare(strict_types=1);

$docroot = rtrim($_SERVER['DOCUMENT_ROOT'] ?? '', '/');
if ($docroot === '') {
    http_response_code(500);
    exit('Configurare lipsă: DOCUMENT_ROOT.');
}

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';

// ---------- rutele aplicației ----------
if ($path === '/admin' || $path === '/admin/logout') {
    require __DIR__ . '/app/admin.php';
    return true;
}
if (str_starts_with($path, '/api/')) {
    require __DIR__ . '/app/api.php';
    return true;
}

// ---------- static: whitelist strict de extensii ----------
const STATIC_EXT = [
    'html' => 'text/html; charset=utf-8',
    'css' => 'text/css; charset=utf-8',
    'js' => 'text/javascript; charset=utf-8',
    'jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png',
    'webp' => 'image/webp', 'svg' => 'image/svg+xml', 'ico' => 'image/x-icon',
    'woff2' => 'font/woff2', 'txt' => 'text/plain; charset=utf-8',
];

// nimic din afara docroot-ului, nimic ascuns (dotfiles), nimic executabil
if ($path !== '/' && !str_contains($path, '..') && !str_contains($path, "\0")) {
    $file = $docroot . $path;
    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    if (isset(STATIC_EXT[$ext]) && is_file($file)) {
        // lăsăm serverul integrat să servească fișierul cu tipul corect + HEAD/gzip
        header('Content-Type: ' . STATIC_EXT[$ext]);
        header('X-Content-Type-Options: nosniff');
        readfile($file);
        return true;
    }
}

if ($path === '/') {
    header('Content-Type: text/html; charset=utf-8');
    readfile($docroot . '/index.html');
    return true;
}

http_response_code(404);
header('Content-Type: text/html; charset=utf-8');
echo '<h1>404 — Nu am găsit pagina</h1><p><a href="/">Înapoi la prima pagină</a></p>';
return true;
