// ============================================================
// Pornire cross-platform (Windows / macOS / Linux) a serverului
// PHP cu php.ini întărit — echivalentul lui start.sh:
//
//   node start.mjs
//   (sau: npm start)
//
// Trebuie rulat din rădăcina proiectului.
// Exportă PROJECT_DIR și DATA_DIR pentru interpolarea ${}
// din php.ini (open_basedir, error_log etc.).
// ============================================================
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)));
const PHPIni = path.join(ROOT, 'server-php', 'php.ini');

// 4 workeri: php -S e single-threaded altfel (cereri paralele așteaptă la coadă)
const env = {
  ...process.env,
  PROJECT_DIR: ROOT,
  DATA_DIR: path.join(ROOT, 'server-php', 'data'),
  TRUST_PROXY: process.env.TRUST_PROXY ?? '0', // pune TRUST_PROXY=1 doar în spatele unui reverse proxy
  PHP_CLI_SERVER_WORKERS: process.env.PHP_CLI_SERVER_WORKERS ?? '4',
};

// Bind pe localhost implicit — /admin pe 0.0.0.0 ar expune parola/cookie-ul
// de sesiune necriptat în rețea. Pe VPS, doar nginx (cu TLS) trebuie public.
const BIND = process.env.BIND ?? '127.0.0.1';

// Pe Windows php.exe e găsit automat de spawn (PATH); `shell: true` doar dacă nu e găsit direct.
const php = spawn('php', [
  '-c', PHPIni,
  '-S', `${BIND}:8462`,
  '-t', path.join(ROOT, 'la-macrea'),
  path.join(ROOT, 'server-php', 'router.php'),
], { env, stdio: 'inherit' });

php.on('error', (err) => {
  if (err.code === 'ENOENT') {
    console.error('Eroare: PHP nu a fost găsit. Instalează PHP 8.2+ (cu pdo_sqlite) și adaugă-l în PATH.');
    console.error('  Windows: https://windows.php.net/download/  ·  macOS: brew install php  ·  Linux: pachetul php-cli');
  } else {
    console.error('Eroare la pornirea PHP:', err.message);
  }
  process.exit(1);
});

// Ctrl+C oprește și procesul copil (altfel rămâne orfan pe Windows)
process.on('SIGINT', () => php.kill());
php.on('exit', (code) => process.exit(code ?? 0));
