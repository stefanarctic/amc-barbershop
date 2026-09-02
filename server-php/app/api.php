<?php
// ============================================================
// /api/* — API JSON (același contract ca vechiul server Node).
// Prepared statements peste tot; nimic concatenat în SQL.
// ============================================================

declare(strict_types=1);
require __DIR__ . '/init.php';
security_headers();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$ip = client_ip();

// utilitar: sloturi ocupate pentru o zi (+specialist) — inclusiv duratele > 30 min
function taken_slots(array $rows, string $date, string $specialist): array
{
    $taken = [];
    foreach ($rows as $b) {
        if ($b['date'] !== $date) continue;
        if ($specialist !== '' && $b['specialist'] !== $specialist) continue;
        $bs = to_minutes($b['time']);
        $be = $bs + (int) $b['duration'];
        for ($s = $bs - ($bs % SLOT_MIN); $s < $be; $s += SLOT_MIN) {
            $taken[sprintf('%02d:%02d', intdiv($s, 60), $s % 60)] = true;
        }
    }
    return array_keys($taken);
}

// ---------- POST /api/bookings (public) ----------
if ($method === 'POST' && $path === '/api/bookings') {
    if (!same_origin()) json_out(403, ['error' => 'Origine nepermisă.']);
    // rate_hit la FIECARE cerere — altfel rate_check numără 0 rânduri și nu limitează nimic
    if (!rate_check('bookings', $ip, 10 * 60, 5)) {
        json_out(429, ['error' => 'Prea multe cereri. Așteaptă câteva minute și încearcă din nou.']);
    }
    rate_hit('bookings', $ip);
    $body = read_json_body();
    $v = validate_booking($body);
    if (isset($v['error'])) json_out(400, ['error' => $v['error']]);

    $b = $v['booking'];
    $dur = $v['duration'];
    $start = to_minutes($b['time']);
    $end = $start + $dur;

    $pdo = db();
    // BEGIN IMMEDIATE: blochează scrierea până la commit — fără race la două
    // cereri simultane pentru același interval (altfel amândouă trec de check).
    $pdo->exec('BEGIN IMMEDIATE');
    try {
        // max 2 programări viitoare per telefon — frânează blocarea completă a agendei
        $st = $pdo->prepare("SELECT COUNT(*) c FROM bookings WHERE phone = ? AND date >= ?");
        $st->execute([$b['phone'], $b['date']]);
        if ((int) $st->fetch()['c'] >= 2) {
            $pdo->exec('ROLLBACK');
            json_out(429, ['error' => 'Ai deja 2 programări viitoare. Anulează una sau sună la frizerie.']);
        }

        // suprapunere la același specialist: [start,end) vs [bs,bs+dur)
        $st = $pdo->prepare('SELECT time, duration FROM bookings
            WHERE date = ? AND specialist = ?');
        $st->execute([$b['date'], $b['specialist']]);
        foreach ($st->fetchAll() as $row) {
            $bs = to_minutes($row['time']);
            $be = $bs + (int) $row['duration'];
            if ($start < $be && $bs < $end) {
                $pdo->exec('ROLLBACK');
                json_out(409, ['error' => 'Există deja o programare care se suprapune cu ora aleasă. Alege alt interval.']);
            }
        }

        $id = bin2hex(random_bytes(16));
        $cancelToken = bin2hex(random_bytes(16));
        $st = $pdo->prepare('INSERT INTO bookings (id, name, phone, service, specialist, date, time, duration, cancel_token, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $st->execute([$id, $b['name'], $b['phone'], $b['service'], $b['specialist'],
            $b['date'], $b['time'], $dur, $cancelToken, gmdate('c')]);
        $pdo->exec('COMMIT');
    } catch (Throwable $e) {
        $pdo->exec('ROLLBACK');
        throw $e;
    }

    json_out(201, ['ok' => true, 'booking' => [
        'id' => $id,
        'name' => $b['name'], 'phone' => $b['phone'], 'service' => $b['service'],
        'specialist' => $b['specialist'], 'date' => $b['date'], 'time' => $b['time'],
        'duration' => $dur, 'createdAt' => gmdate('c'),
        // tokenul de anulare pleacă o singură dată, la creare, spre dispozitivul clientului
        'cancelToken' => $cancelToken,
    ]]);
}

// ---------- GET /api/availability?date=&specialist= (public) ----------
if ($method === 'GET' && $path === '/api/availability') {
    $date = clean_str($_GET['date'] ?? '', 10);
    $specialist = clean_str($_GET['specialist'] ?? '', 80);
    if (!preg_match(RE_DATE, $date)) json_out(400, ['error' => 'Dată invalidă.']);
    $st = db()->prepare('SELECT time, duration, specialist FROM bookings WHERE date = ?');
    $st->execute([$date]);
    json_out(200, ['taken' => taken_slots($st->fetchAll(), $date, $specialist)]);
}

// ---------- GET /api/my-bookings?phone= (public) ----------
if ($method === 'GET' && $path === '/api/my-bookings') {
    if (!rate_check('myBookings', $ip, 60, 20)) json_out(429, ['error' => 'Prea multe cereri.']);
    rate_hit('myBookings', $ip);
    $phone = str_replace(' ', '', clean_str($_GET['phone'] ?? '', 16));
    if (!preg_match(RE_PHONE, $phone)) json_out(400, ['error' => 'Telefon invalid.']);
    // ATENȚIE: fără token aici se poate enumera după telefon, deci expunem DOAR
    // minimul necesar (fără nume/telefon) — detalii complete/anulare doar cu token.
    $st = db()->prepare('SELECT id, service, specialist, date, time, duration
        FROM bookings WHERE phone = ? ORDER BY date, time');
    $st->execute([$phone]);
    json_out(200, ['bookings' => $st->fetchAll()]);
}

// ---------- DELETE /api/my-bookings?id=&token= (public) ----------
if ($method === 'DELETE' && $path === '/api/my-bookings') {
    if (!same_origin()) json_out(403, ['error' => 'Origine nepermisă.']);
    if (!rate_check('myBookings', $ip, 60, 20)) json_out(429, ['error' => 'Prea multe cereri.']);
    rate_hit('myBookings', $ip);
    $id = clean_str($_GET['id'] ?? '', 40);
    $token = clean_str($_GET['token'] ?? '', 40);
    if ($id === '' || $token === '') json_out(400, ['error' => 'Cerere invalidă.']);
    $st = db()->prepare('SELECT id, name, phone, date, time FROM bookings WHERE id = ? AND cancel_token = ?');
    $st->execute([$id, $token]);
    $row = $st->fetch();
    if (!$row) json_out(404, ['error' => 'Programarea nu a fost găsită.']);
    db()->prepare('DELETE FROM bookings WHERE id = ?')->execute([$id]);
    audit('cancel-public', ['id' => $row['id'], 'client' => $row['name'], 'phone' => $row['phone'],
        'date' => $row['date'], 'time' => $row['time']]);
    json_out(200, ['ok' => true]);
}

// ---------- sub aceasta: doar admin ----------
require_admin();

// ---------- GET /api/bookings (admin) ----------
if ($method === 'GET' && $path === '/api/bookings') {
    $st = db()->query('SELECT id, name, phone, service, specialist, date, time, duration, created_at AS createdAt
        FROM bookings ORDER BY date, time');
    json_out(200, ['bookings' => $st->fetchAll()]);
}

// ---------- DELETE /api/bookings/{id} (admin) ----------
if ($method === 'DELETE' && str_starts_with($path, '/api/bookings/')) {
    csrf_check($_SERVER['HTTP_X_CSRF_TOKEN'] ?? null);
    $id = clean_str(substr($path, strlen('/api/bookings/')), 40);
    $st = db()->prepare('SELECT id, name, phone, date, time FROM bookings WHERE id = ?');
    $st->execute([$id]);
    $row = $st->fetch();
    if (!$row) json_out(404, ['error' => 'Programarea nu există.']);
    db()->prepare('DELETE FROM bookings WHERE id = ?')->execute([$id]);
    audit('cancel-admin', ['id' => $row['id'], 'client' => $row['name'], 'phone' => $row['phone'],
        'date' => $row['date'], 'time' => $row['time']]);
    json_out(200, ['ok' => true]);
}

json_out(404, ['error' => 'Rută inexistentă.']);
