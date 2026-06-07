import { ApiError } from '../lib/http.js';

export function notFoundHandler(req, res) {
  res.status(404).json({ error: { code: 'not_found', message: 'Ruta no encontrada' } });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message } });
  }
  console.error('[HiperTracker] Error no controlado:', err);
  res.status(500).json({ error: { code: 'internal_error', message: 'Error interno del servidor' } });
}
