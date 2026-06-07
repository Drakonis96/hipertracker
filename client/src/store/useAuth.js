import { create } from 'zustand';
import {
  api,
  setTokens,
  setGateToken,
  setOnAuthChange,
  setOnUnauthorized,
  setOnGateRequired,
} from '../api/client';
import { useUI } from './useUI';
import { useData } from './useData';

const STORAGE_KEY = 'hipertracker.auth';
const GATE_KEY = 'hipertracker.gate';
const DEFAULTS = { theme: 'system', accent: '#10b981' };

function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
  } catch {
    return null;
  }
}
function saveSession(data) {
  if (data && data.tokens?.access) localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  else localStorage.removeItem(STORAGE_KEY);
}

export const useAuth = create((set, get) => ({
  status: 'loading', // loading | ready
  profiles: [],
  profile: null,
  tokens: { access: null, refresh: null },
  skipAutoLogin: false, // tras "Cambiar de perfil" no auto-entrar aunque haya un único perfil sin PIN
  gateEnabled: false, // el servidor exige login de la app
  gateAuthed: false, // ya hemos pasado ese login

  // Arranque: primero el "portero" (login de la app si está activado), luego la sesión.
  bootstrap: async () => {
    setOnGateRequired(() => {
      localStorage.removeItem(GATE_KEY);
      setGateToken(null);
      set({ gateAuthed: false });
    });

    const savedGate = localStorage.getItem(GATE_KEY);
    if (savedGate) setGateToken(savedGate);

    let enabled = false;
    try {
      const g = await api('/gate', { auth: false });
      enabled = !!g.enabled;
    } catch {
      /* sin gate / servidor no disponible */
    }
    set({ gateEnabled: enabled, gateAuthed: !enabled || !!savedGate });

    if (enabled && !savedGate) {
      useUI.getState().apply(DEFAULTS);
      set({ status: 'ready' });
      return;
    }
    await get().init();
  },

  gateLogin: async (username, password) => {
    const data = await api('/gate/login', { method: 'POST', auth: false, body: { username, password } });
    if (data.token) {
      localStorage.setItem(GATE_KEY, data.token);
      setGateToken(data.token);
    }
    set({ gateAuthed: true });
    await get().init();
  },

  init: async () => {
    const saved = loadSaved();
    if (saved?.tokens) setTokens(saved.tokens);

    setOnAuthChange((tokens, profile) => {
      const next = { tokens, profile: profile || get().profile };
      set(next);
      saveSession(next);
    });
    setOnUnauthorized(() => get().logout());

    if (saved?.profile && saved?.tokens?.access) {
      set({ profile: saved.profile, tokens: saved.tokens });
      useUI.getState().apply({ theme: saved.profile.theme, accent: saved.profile.accentColor });
    } else {
      useUI.getState().apply(DEFAULTS);
    }

    await get().loadProfiles();
    set({ status: 'ready' });
  },

  loadProfiles: async () => {
    try {
      const profiles = await api('/profiles', { auth: false });
      set({ profiles });
      return profiles;
    } catch {
      return [];
    }
  },

  login: async (profileId, pin) => {
    const data = await api('/auth/login', { method: 'POST', auth: false, body: { profileId, pin } });
    const tokens = { access: data.token, refresh: data.refreshToken };
    setTokens(tokens);
    set({ profile: data.profile, tokens, skipAutoLogin: false });
    saveSession({ tokens, profile: data.profile });
    useUI.getState().apply({ theme: data.profile.theme, accent: data.profile.accentColor });
    return data.profile;
  },

  logout: () => {
    setTokens(null);
    saveSession(null);
    set({ profile: null, tokens: { access: null, refresh: null }, skipAutoLogin: true });
    useData.getState().reset();
    useUI.getState().apply(DEFAULTS);
  },

  createProfile: async (payload) => {
    const created = await api('/profiles', { method: 'POST', auth: !!get().profile, body: payload });
    await get().loadProfiles();
    return created;
  },

  updateProfile: async (id, patch) => {
    const updated = await api(`/profiles/${id}`, { method: 'PATCH', body: patch });
    if (get().profile?.id === id) {
      set({ profile: updated });
      saveSession({ tokens: get().tokens, profile: updated });
    }
    await get().loadProfiles();
    return updated;
  },

  deleteProfile: async (id) => {
    await api(`/profiles/${id}`, { method: 'DELETE' });
    await get().loadProfiles();
  },
}));
