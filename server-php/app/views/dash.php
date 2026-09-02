<?php /** Dashboard-ul de programări — aceeași interfață ca înainte, acum sub /admin. */ ?>
<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex, nofollow" />
  <meta name="csrf" content="<?= htmlspecialchars($csrf, ENT_QUOTES, 'UTF-8') ?>" />
  <title>Dashboard programări | Frizeria „La Macrea”</title>
  <link rel="stylesheet" href="/css/admin.css" />
</head>
<body>
  <header class="admin-bar">
    <span class="brand">La Macrea <em>admin</em></span>
    <form method="post" action="/admin?action=logout" class="inline-form">
      <input type="hidden" name="csrf" value="<?= htmlspecialchars($csrf, ENT_QUOTES, 'UTF-8') ?>" />
      <button type="submit" class="btn btn-outline">Deconectare</button>
    </form>
  </header>

  <main class="admin-main">
    <section class="dash">
      <div class="dash-head">
        <h1>Programări</h1>
        <div class="dash-filters">
          <select id="filterBarber"><option value="">Toți specialiștii</option></select>
          <select id="filterWhen">
            <option value="upcoming">Viitoare</option>
            <option value="past">Trecute</option>
            <option value="all">Toate</option>
          </select>
        </div>
      </div>
      <p class="muted dash-note">Programările sosesc live de la toți clienții (salvate pe server). Sincronizează-le în Google Calendar cu butoanele de mai jos.</p>
      <div id="adminBookings" class="admin-list"></div>
      <p id="adminEmpty" class="muted" hidden>Nicio programare aici.</p>
    </section>
  </main>

  <script src="/js/admin.js"></script>
</body>
</html>
