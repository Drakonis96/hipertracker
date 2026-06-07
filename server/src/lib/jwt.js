import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export function signAccessToken(profile) {
  return jwt.sign(
    { sub: profile.id, isAdmin: !!profile.isAdmin, type: 'access' },
    config.jwtSecret,
    { expiresIn: config.accessTokenTtl },
  );
}

export function signRefreshToken(profile) {
  return jwt.sign(
    { sub: profile.id, type: 'refresh' },
    config.jwtSecret,
    { expiresIn: config.refreshTokenTtl },
  );
}

// Token del "portero" de la app (login propio activable por env).
export function signGateToken() {
  return jwt.sign({ type: 'gate' }, config.jwtSecret, { expiresIn: config.gateTokenTtl });
}

export function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}
