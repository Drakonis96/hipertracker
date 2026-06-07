import { create } from 'zustand';
import { rgbString, contrastRgbString } from '../lib/colors';
import { useAuth } from './useAuth';

let mq = null;

function systemPrefersDark() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyThemeToDom(theme) {
  const dark = theme === 'dark' || (theme === 'system' && systemPrefersDark());
  document.documentElement.classList.toggle('dark', dark);
}

function applyAccentToDom(hex) {
  const root = document.documentElement;
  root.style.setProperty('--accent-rgb', rgbString(hex));
  root.style.setProperty('--accent-fg-rgb', contrastRgbString(hex));
}

// Persiste la preferencia en el perfil activo (si hay sesión).
async function persistPref(patch) {
  try {
    const auth = useAuth.getState();
    if (auth.profile) await auth.updateProfile(auth.profile.id, patch);
  } catch {
    /* sin sesión: solo local */
  }
}

export const useUI = create((set, get) => ({
  theme: 'system', // light | dark | system
  accent: '#10b981',

  apply: ({ theme, accent } = {}) => {
    const t = theme ?? get().theme;
    const a = accent ?? get().accent;
    applyThemeToDom(t);
    applyAccentToDom(a);
    set({ theme: t, accent: a });
    if (!mq && window.matchMedia) {
      mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', () => {
        if (get().theme === 'system') applyThemeToDom('system');
      });
    }
  },

  setTheme: async (theme) => {
    applyThemeToDom(theme);
    set({ theme });
    await persistPref({ theme });
  },

  setAccent: async (accent) => {
    applyAccentToDom(accent);
    set({ accent });
    await persistPref({ accentColor: accent });
  },
}));
