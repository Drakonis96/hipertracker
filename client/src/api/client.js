// Cliente HTTP con:
//  - token de "portero" de la app (login propio) en cabecera X-App-Auth
//  - token de perfil (JWT) en X-Auth-Token, con refresh automático
const BASE = '/api/v1';

let tokens = { access: null, refresh: null };
let gateToken = null;
let onAuthChange = null; // (tokens, profile) => void  — al renovar token de perfil
let onUnauthorized = null; // () => void  — al perder la sesión de perfil
let onGateRequired = null; // () => void  — cuando falta/caduca el login de la app
let refreshing = null;

export function setTokens(t) {
  tokens = t || { access: null, refresh: null };
}
export function getTokens() {
  return tokens;
}
export function setGateToken(t) {
  gateToken = t || null;
}
export function getGateToken() {
  return gateToken;
}
export function setOnAuthChange(fn) {
  onAuthChange = fn;
}
export function setOnUnauthorized(fn) {
  onUnauthorized = fn;
}
export function setOnGateRequired(fn) {
  onGateRequired = fn;
}

async function doRefresh() {
  if (!tokens.refresh) throw new Error('Sin refresh token');
  if (!refreshing) {
    refreshing = fetch(`${BASE}/auth/refresh`, buildInit('POST', { refreshToken: tokens.refresh }, false))
      .then(async (r) => {
        if (!r.ok) throw new Error('No se pudo renovar la sesión');
        const data = await r.json();
        tokens = { access: data.token, refresh: data.refreshToken };
        onAuthChange?.(tokens, data.profile);
        return tokens;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

function buildInit(method, body, useAuth) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (gateToken) headers['X-App-Auth'] = gateToken;
  if (useAuth && tokens.access) headers['X-Auth-Token'] = tokens.access;
  return { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined };
}

export async function api(path, { method = 'GET', body, auth = true } = {}) {
  const url = `${BASE}${path}`;
  let res = await fetch(url, buildInit(method, body, auth));

  // Refresh del token de perfil ante un 401 (salvo que sea del portero).
  if (res.status === 401 && auth && tokens.refresh) {
    let code;
    try {
      code = (await res.clone().json())?.error?.code;
    } catch {
      /* ignore */
    }
    if (code !== 'gate_required') {
      try {
        await doRefresh();
        res = await fetch(url, buildInit(method, body, auth));
      } catch {
        onUnauthorized?.();
      }
    }
  }

  if (!res.ok) {
    let message = 'Se produjo un error';
    let code;
    try {
      const data = await res.json();
      message = data?.error?.message || message;
      code = data?.error?.code;
    } catch {
      /* ignore */
    }
    if (code === 'gate_required') onGateRequired?.();
    else if (res.status === 401 && auth) onUnauthorized?.();
    const err = new Error(message);
    err.status = res.status;
    err.code = code;
    throw err;
  }

  if (res.status === 204) return null;
  return res.json();
}

// Descarga autenticada (exportación) → devuelve Blob.
export async function apiDownload(path) {
  const res = await fetch(`${BASE}${path}`, buildInit('GET', undefined, true));
  if (!res.ok) throw new Error('No se pudo exportar');
  return res.blob();
}
