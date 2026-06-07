import { ApiError } from '../lib/http.js';

// IP del cliente real detrás de un reverse proxy / CDN (Cloudflare, NPM…).
export function clientIp(req) {
  return (
    req.headers['cf-connecting-ip'] ||
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    req.ip ||
    'unknown'
  );
}

// Limitador en memoria (ventana fija por IP). Sin dependencias externas.
// onlyFailures: cuenta solo respuestas de error (ideal para login: no penaliza
// los accesos correctos, pero frena la fuerza bruta).
export function rateLimit({ windowMs, max, onlyFailures = false, code = 'rate_limited' }) {
  const hits = new Map(); // ip -> { count, resetAt }

  // Limpieza periódica para no acumular memoria.
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [k, v] of hits) if (now > v.resetAt) hits.delete(k);
  }, windowMs);
  if (timer.unref) timer.unref();

  return (req, res, next) => {
    const key = clientIp(req);
    const now = Date.now();
    let entry = hits.get(key);
    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }
    if (entry.count >= max) {
      const retry = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
      res.setHeader('Retry-After', String(retry));
      return next(new ApiError(429, `Demasiados intentos. Inténtalo de nuevo en ${retry} s.`, code));
    }
    if (onlyFailures) {
      res.on('finish', () => {
        if (res.statusCode >= 400) entry.count += 1;
      });
    } else {
      entry.count += 1;
    }
    next();
  };
}

// Login: pocas combinaciones, ventana amplia, solo cuenta fallos.
export const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, onlyFailures: true });

// API general: tope generoso por IP como defensa frente a abuso.
export const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 600 });
