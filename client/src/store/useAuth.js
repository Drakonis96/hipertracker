import { create } from 'zustand';
import { api, setTokens, setOnAuthChange, setOnUnauthorized } from '../api/client';
import { useUI } from './useUI';
import { useData } from './useData';

const STORAGE_KEY = 'hipertracker.auth';
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
