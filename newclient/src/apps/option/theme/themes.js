// Theme presets. Each theme is a full set of the 9 color tokens (hex).
// Tokens drive BOTH the Tailwind utility classes (via CSS variables) and the
// JS PALETTE used by charts/inline styles, so switching is instant everywhere.

export const THEMES = {
  midnight: {
    label: "Midnight",
    dark: true,
    tokens: {
      bg: "#0a0e1a",
      card: "#0f1520",
      border: "#1e2d45",
      bullish: "#00c896",
      bearish: "#ff4560",
      neutral: "#00b4d8",
      warning: "#ffd166",
      txt: "#e2e8f0",
      muted: "#64748b",
    },
  },
  carbon: {
    label: "Carbon",
    dark: true,
    tokens: {
      bg: "#0b0c10",
      card: "#15171c",
      border: "#2a2d36",
      bullish: "#34d399",
      bearish: "#fb7185",
      neutral: "#38bdf8",
      warning: "#fbbf24",
      txt: "#e8eaed",
      muted: "#6b7280",
    },
  },
  slate: {
    label: "Slate",
    dark: true,
    tokens: {
      bg: "#111827",
      card: "#1c2433",
      border: "#334155",
      bullish: "#10b981",
      bearish: "#f43f5e",
      neutral: "#22d3ee",
      warning: "#f59e0b",
      txt: "#e5edf5",
      muted: "#7c8aa0",
    },
  },
  aurora: {
    label: "Aurora",
    dark: true,
    tokens: {
      bg: "#0c0a1d",
      card: "#161430",
      border: "#2e2a55",
      bullish: "#34d399",
      bearish: "#fb7185",
      neutral: "#8b5cf6",
      warning: "#fcd34d",
      txt: "#e8e6f5",
      muted: "#756f9c",
    },
  },
  daylight: {
    label: "Daylight",
    dark: false,
    tokens: {
      bg: "#f5f7fb",
      card: "#ffffff",
      border: "#d9e0ea",
      bullish: "#059669",
      bearish: "#e11d48",
      neutral: "#0284c7",
      warning: "#d97706",
      txt: "#0f172a",
      muted: "#5b6675",
    },
  },
};

export const THEME_KEYS = Object.keys(THEMES);
export const DEFAULT_THEME = "midnight";
const STORAGE_KEY = "oca_theme";

// "#0a0e1a" -> "10 14 26" (space-separated RGB channels for `rgb(var() / a)`).
export function hexToChannels(hex) {
  let h = String(hex).replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

// Apply a theme's tokens to the document root as CSS variables (drives Tailwind
// classes). Returns the theme object.
export function applyThemeVars(key) {
  const t = THEMES[key] || THEMES[DEFAULT_THEME];
  if (typeof document !== "undefined") {
    const root = document.documentElement;
    for (const [k, v] of Object.entries(t.tokens)) {
      root.style.setProperty(`--c-${k}`, hexToChannels(v));
    }
    root.dataset.theme = key;
    root.style.colorScheme = t.dark ? "dark" : "light";
  }
  return t;
}

export function getInitialThemeKey() {
  try {
    const k = localStorage.getItem(STORAGE_KEY);
    if (k && THEMES[k]) return k;
  } catch {
    /* ignore */
  }
  return DEFAULT_THEME;
}

export function persistThemeKey(key) {
  try {
    localStorage.setItem(STORAGE_KEY, key);
  } catch {
    /* ignore */
  }
}
