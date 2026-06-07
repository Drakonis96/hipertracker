// Cliente HTTP con Bearer token y refresh automático.
const BASE = '/api/v1';

let tokens = { access: null, refresh: null };
let onAuthChange = null; // (tokens, profile) => void  — al renovar token
let onUnauthorized = null; // () => void  — al perder la sesión
let refreshing = null;

export function setTokens(t) {
  tokens = t || { access: null, refresh: null };
}
export function getTokens() {
  return tokens;
}
export function setOnAuthChange(fn) {
  onAuthChange = fn;
}
export function setOnUnauthorized(fn) {
  onUnauthorized = fn;
}

async function doRefresh() {
  if (!tokens.refresh) throw new Error('Sin refresh token');
  if (!refreshing) {
    refreshing = fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: tokens.refresh }),
    })
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
  if (useAuth && tokens.access) headers.Authorization = `Bearer ${tokens.access}`;
  return { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined };
}

export async function api(path, { method = 'GET', body, auth = true } = {}) {
  const url = `${BASE}${path}`;
  let res = await fetch(url, buildInit(method, body, auth));

  if (res.status === 401 && auth && tokens.refresh) {
    try {
      await doRefresh();
      res = await fetch(url, buildInit(method, body, auth));
    } catch {
      onUnauthorized?.();
    }
  }
  if (res.status === 401 && auth) {
    onUnauthorized?.();
  }

  if (!res.ok) {
    let message = 'Se produjo un error';
    try {
      const data = await res.json();
      message = data?.error?.message || message;
    } catch {
      /* ignore */
    }
    const err = new Error(message);
    err.status = res.status;
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
