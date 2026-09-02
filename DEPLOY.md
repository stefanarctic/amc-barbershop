# Publicarea site-ului (hosting)

Site-ul = `la-macrea/` (static) + `server-php/` (API programări, PHP 8.2+ cu extensiile
`pdo_sqlite`/`sqlite3`, fără dependențe).

## Local

```
./server-php/bin/start.sh      # Linux / macOS
# sau, cross-platform (Windows inclus):
node start.mjs                 # sau: npm start
# http://localhost:8462
```

Scriptul setează singur `PROJECT_DIR`/`DATA_DIR` (folosite de interpolarea `${}` din
`server-php/php.ini`), pornește cu 4 workeri și ascultă pe `127.0.0.1:8462`.

Parolă admin (o setezi o singură dată, rămâne și după restart):

```
# Linux / macOS:
export PROJECT_DIR="$(pwd)" DATA_DIR="$(pwd)/server-php/data"
php -c server-php/php.ini server-php/bin/setpass.php "PAROLA_TA"   # minim 8 caractere

# Windows (PowerShell):
$env:PROJECT_DIR = (Get-Location).Path; $env:DATA_DIR = "$env:PROJECT_DIR\server-php\data"
php -c server-php/php.ini server-php/bin/setpass.php "PAROLA_TA"   # minim 8 caractere
```

Dashboard admin: `http://localhost:8462/admin`

## Ce trebuie la hosting (FOARTE important)

### 1. Stocare persistentă pentru programări
Programările se salvează în `server-php/data/amc.db` (SQLite). Multe platforme au **disc
efemer** — la fiecare redeploy/restart **pierzi toate programările**. Pe VPS nimic de
configurat; în containere montează un volum pe `server-php/data/`.

### 2. HTTPS
Obligatoriu (date personale). Cea mai simplă cale: nginx + certbot pe VPS. Cu `TRUST_PROXY=1`
serverul detectează HTTPS-ul real prin `X-Forwarded-Proto` și activează cookie `Secure` + HSTS.

### 3. TRUST_PROXY — doar în spatele proxy-ului tău
Serverul limitează încercările de login și de programări pe IP. Direct pe internet e OK,
dar **în spatele nginx/proxy al platformei toți vizitatorii par din același IP**. În acel
caz setează `TRUST_PROXY=1`.

Serverul va lua IP-ul clientului din **ultimul** element al `X-Forwarded-For` — cel adăugat
de proxy-ul tău de încredere. **NU** seta asta dacă serverul e expus direct (headerul poate
fi falsificat).

### Variabile de mediu
| Variabilă    | Implicit    | Ce face                                              |
|--------------|-------------|------------------------------------------------------|
| `BIND`       | `127.0.0.1` | interfața ascultată (`0.0.0.0` doar dacă nu ai proxy) |
| `TRUST_PROXY`| `0`         | `1` = ia IP-ul real din `X-Forwarded-For` (doar în spatele proxy-ului) |
| `PHP_CLI_SERVER_WORKERS` | `4` | workeri `php -S` (paralelism cereri)          |

## Exemplu systemd (VPS)

`/etc/systemd/system/amc.service`:

```ini
[Unit]
Description=Frizeria AMC - site + programari
After=network.target

[Service]
WorkingDirectory=/opt/amc
ExecStart=/opt/amc/server-php/bin/start.sh
Restart=always
User=www-data

[Install]
WantedBy=multi-user.target
```

```
sudo systemctl enable --now amc
```

## Exemplu nginx (reverse proxy + HTTPS)

```nginx
server {
    listen 443 ssl;
    server_name domeniul-tau.ro;
    # certificate de la certbot aici

    location / {
        proxy_pass http://127.0.0.1:8462;
        proxy_set_header Host $host;
        # $remote_addr SUPRASCRIE headerul — cu $proxy_add_x_forwarded_for clientul
        # ar putea falsifica primul element și ocoli rate limiting-ul
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Cu nginx în fața, pornește serverul cu `TRUST_PROXY=1`.

## Robustețe deja implementate (server-php)
- SQLite (WAL) cu prepared statements peste tot; tranzacție `BEGIN IMMEDIATE` la programări
- parole ca hash Argon2id/Bcrypt; sesiuni HttpOnly + SameSite=Strict + `use_strict_mode`
- CSRF pe sesiune + verificare same-origin la orice cerere care modifică date
- rate limiting în DB: login 5/15 min, programări 5/10 min, interogări telefon 20/min (per IP)
- max 2 programări viitoare per telefon
- `open_basedir` + `disable_functions` în `server-php/php.ini`
- jurnal de audit la fiecare anulare (`server-php/data/amc.db`, tabela `audit_log`)
- `Cache-Control: no-store` pe tot API-ul (date personale)
