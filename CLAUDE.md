# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Website + sistem de programări pentru Frizeria „La Macrea” (Sibiu) — site static în `la-macrea/` și backend PHP fără dependențe în `server-php/`. Tot textul către utilizator e în română (`lang="ro"`).

## Running

```
node start.mjs
# sau: npm start
# http://localhost:8462
```

Pe Linux/macOS: `./server-php/bin/start.sh`.

Parolă admin (o dată, persistă în SQLite):

```
# Windows (PowerShell):
$env:PROJECT_DIR = (Get-Location).Path; $env:DATA_DIR = "$env:PROJECT_DIR\server-php\data"
php -c server-php/php.ini server-php/bin/setpass.php "PAROLA_TA"

# Linux / macOS:
export PROJECT_DIR="$(pwd)" DATA_DIR="$(pwd)/server-php/data"
php -c server-php/php.ini server-php/bin/setpass.php "PAROLA_TA"
```

Dashboard: `http://localhost:8462/admin`. Publicare: vezi `DEPLOY.md`.

## Architecture

- `la-macrea/` — site-ul public (HTML/CSS/JS). Docroot-ul serverului PHP.
- `la-macrea/js/script.js` — logica publică și **sursa de adevăr pentru conținut**: `SERVICES`, `TEAM`, `REVIEWS`, `EXTRA_REVIEWS`, `MERO_REVIEWS`, `SCHEDULE`, `OPENING`. Modifică aici prețuri, frizeri, program — nu în HTML. `SCHEDULE` și duratele serviciilor trebuie ținute sincron cu `server-php/app/init.php`.
- `la-macrea/css/style.css` — tema dark/gold, mobile-first.
- `la-macrea/js/admin.js` + `la-macrea/css/admin.css` — dashboard-ul de la `/admin` (login-ul e server-side).
- `server-php/` — API (`/api/*`), admin (`/admin`), SQLite în `server-php/data/amc.db`.
- `start.mjs` — pornește `php -S` pe `127.0.0.1:8462` cu `php.ini` întărit.

Comportamente importante:

- **Programări**: formularul trimite la `/api/bookings`. Sloturile vin din `/api/availability`. Telefon: `/^0[0-9]{9}$/`.
- **Recenzii**: recenziile trimise de vizitatori stau în `localStorage` (`lm_reviews`), doar 4+ stele, doar în browserul autorului. `MERO_REVIEWS` e pentru recenzii reale de pe Mero — recenziile false sunt ilegale; se afișează 6 pe zi în rotație, nimic dacă array-ul e gol.
- **Galerie**: poze `client-1.jpg` … în `la-macrea/assets/galerie/` (jpg/jpeg/png/webp). JS sondează până la 12 sloturi și ascunde fișierele lipsă.
- **Confidențialitate**: iframe-ul Google Maps se încarcă doar după click pe „Încarcă harta” (consimțământ GDPR — păstrează-l).
- **XSS**: orice text de la utilizator interpolat în `innerHTML` trece prin `escapeHtml()`.
