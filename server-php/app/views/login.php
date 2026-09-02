<?php /** Pagina de login — randată server-side, CSRF inclus. */ ?>
<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex, nofollow" />
  <title>Autentificare — Admin | Frizeria „La Macrea”</title>
  <link rel="stylesheet" href="/css/admin.css" />
</head>
<body>
  <header class="admin-bar">
    <span class="brand">La Macrea <em>admin</em></span>
  </header>
  <main class="admin-main">
    <section class="login-gate">
      <h1>Dashboard programări</h1>
      <p class="muted">Introdu parola de administrator.</p>
      <form method="post" action="/admin" autocomplete="off">
        <input type="hidden" name="csrf" value="<?= htmlspecialchars($csrf, ENT_QUOTES, 'UTF-8') ?>" />
        <input type="password" name="password" id="adminPass" placeholder="Parolă admin" required autofocus
               maxlength="128" autocomplete="current-password" />
        <button type="submit" class="btn btn-gold">Intră</button>
        <?php if (!empty($loginError)): ?>
          <p class="form-msg err"><?= htmlspecialchars($loginError, ENT_QUOTES, 'UTF-8') ?></p>
        <?php endif; ?>
      </form>
    </section>
  </main>
</body>
</html>
