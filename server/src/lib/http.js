// Error de API con código HTTP y mensaje en español.
export class ApiError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code || undefined;
  }
}

export const badRequest = (msg) => new ApiError(400, msg, 'bad_request');
export const unauthorized = (msg = 'No autorizado') => new ApiError(401, msg, 'unauthorized');
export const forbidden = (msg = 'No tienes permiso para esta acción') => new ApiError(403, msg, 'forbidden');
export const notFound = (msg = 'Recurso no encontrado') => new ApiError(404, msg, 'not_found');
export const conflict = (msg) => new ApiError(409, msg, 'conflict');

// Envuelve handlers async para propagar errores al middleware de errores.
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
