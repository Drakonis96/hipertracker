// Página de login server-side, autocontenida (sin assets externos). Se sirve a
// navegadores no autenticados cuando el login de la app está activado, de modo
// que ni el HTML de la SPA se expone sin credenciales.
export const gatePageHtml = `<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="robots" content="noindex,nofollow" />
<meta name="color-scheme" content="dark light" />
<title>HiperTracker</title>
<style>
  :root { color-scheme: dark light; }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: #09090b; color: #fafafa;
    font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    padding: 24px;
  }
  .card { width: 100%; max-width: 360px; }
  .head { text-align: center; margin-bottom: 28px; }
  .logo {
    width: 64px; height: 64px; border-radius: 16px; background: #000;
    display: inline-flex; align-items: center; justify-content: center; font-size: 34px;
    border: 0.5px solid #27272a;
  }
  h1 { font-size: 22px; margin: 14px 0 4px; }
  .sub { color: #a1a1aa; font-size: 14px; display: flex; gap: 6px; align-items: center; justify-content: center; }
  form { border: 0.5px solid #27272a; background: #18181b; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
  label { font-size: 14px; color: #d4d4d8; margin-bottom: 6px; display: block; }
  input {
    width: 100%; padding: 11px 12px; border-radius: 8px; border: 0.5px solid #3f3f46;
    background: #27272a; color: #fafafa; font-size: 15px; outline: none;
  }
  input:focus { border-color: #10b981; box-shadow: 0 0 0 2px rgba(16,185,129,.3); }
  button {
    margin-top: 4px; padding: 11px; border: 0; border-radius: 8px; background: #10b981; color: #062b20;
    font-size: 15px; font-weight: 600; cursor: pointer;
  }
  button:disabled { opacity: .6; cursor: default; }
  .err { color: #f87171; font-size: 14px; min-height: 1em; }
  .foot { text-align: center; color: #71717a; font-size: 12px; margin-top: 16px; }
</style>
</head>
<body>
  <div class="card">
    <div class="head">
      <div class="logo">🛒</div>
      <h1>HiperTracker</h1>
      <div class="sub">🔒 Acceso restringido</div>
    </div>
    <form id="f">
      <div>
        <label for="u">Usuario</label>
        <input id="u" name="username" autocomplete="username" autocapitalize="none" autocorrect="off" required />
      </div>
      <div>
        <label for="p">Contraseña</label>
        <input id="p" name="password" type="password" autocomplete="current-password" required />
      </div>
      <div class="err" id="err"></div>
      <button id="btn" type="submit">Entrar</button>
    </form>
    <div class="foot">Tus credenciales viajan cifradas y no se almacenan en el servidor.</div>
  </div>
<script>
  var f = document.getElementById('f'), u = document.getElementById('u'),
      p = document.getElementById('p'), btn = document.getElementById('btn'),
      err = document.getElementById('err');
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    btn.disabled = true; err.textContent = '';
    fetch('/api/v1/gate/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u.value, password: p.value })
    }).then(function (r) {
      if (r.ok) { location.reload(); return; }
      return r.json().catch(function () { return {}; }).then(function (d) {
        err.textContent = (d.error && d.error.message) || 'Usuario o contraseña incorrectos';
        p.value = ''; btn.disabled = false;
      });
    }).catch(function () { err.textContent = 'No se pudo conectar con el servidor'; btn.disabled = false; });
  });
</script>
</body>
</html>`;
