// Color logic mapping signals/values to the active theme palette.
//
// PALETTE is a *mutable* hex map for inline styles / Recharts (which need real
// hex strings, not CSS vars). `applyPalette()` rewrites it from a theme's
// tokens; it's updated synchronously on theme change so the next render reads
// fresh values. The `+ "22"` opacity-append pattern keeps working since these
// stay hex strings.
import { THEMES, DEFAULT_THEME, getInitialThemeKey } from "../theme/themes.js";

export const PALETTE = {
  bg: "#0a0e1a",
  card: "#0f1520",
  border: "#1e2d45",
  bullish: "#00c896",
  bearish: "#ff4560",
  neutral: "#00b4d8",
  warning: "#ffd166",
  txt: "#e2e8f0",
  text: "#e2e8f0", // alias kept for existing call sites
  muted: "#64748b",
};

export function applyPalette(tokens) {
  PALETTE.bg = tokens.bg;
  PALETTE.card = tokens.card;
  PALETTE.border = tokens.border;
  PALETTE.bullish = tokens.bullish;
  PALETTE.bearish = tokens.bearish;
  PALETTE.neutral = tokens.neutral;
  PALETTE.warning = tokens.warning;
  PALETTE.txt = tokens.txt;
  PALETTE.text = tokens.txt;
  PALETTE.muted = tokens.muted;
}

// Initialise to the persisted theme at import, so the very first render of
// chart/inline colors already matches the chosen theme.
applyPalette((THEMES[getInitialThemeKey()] || THEMES[DEFAULT_THEME]).tokens);

// Direction / signal -> hex color.
export function signalColor(signal) {
  const s = String(signal || "").toUpperCase();
  if (s.includes("BULL")) return PALETTE.bullish;
  if (s.includes("BEAR")) return PALETTE.bearish;
  if (s.includes("SIDE") || s.includes("NEUTRAL")) return PALETTE.neutral;
  return PALETTE.muted;
}

// Tailwind text class for a signal.
export function signalTextClass(signal) {
  const s = String(signal || "").toUpperCase();
  if (s.includes("BULL")) return "text-bullish";
  if (s.includes("BEAR")) return "text-bearish";
  if (s.includes("SIDE") || s.includes("NEUTRAL")) return "text-neutral";
  return "text-muted";
}

// Positive green / negative red / zero muted for numbers.
export function deltaColor(value) {
  const n = Number(value);
  if (Number.isNaN(n) || n === 0) return PALETTE.muted;
  return n > 0 ? PALETTE.bullish : PALETTE.bearish;
}

// OI build-up pattern -> color.
export function patternColor(pattern) {
  switch (String(pattern || "").toUpperCase()) {
    case "LONG BUILD":
      return PALETTE.bullish;
    case "SHORT BUILD":
      return PALETTE.bearish;
    case "SHORT COVER":
      return PALETTE.warning;
    case "LONG UNWIND":
      return "#f97316"; // orange
    default:
      return PALETTE.muted;
  }
}

// Strength badge -> color.
export function strengthColor(strength) {
  switch (String(strength || "").toUpperCase()) {
    case "VERY STRONG":
      return "#ef4444";
    case "STRONG":
      return "#f97316";
    case "MODERATE":
      return PALETTE.warning;
    default:
      return PALETTE.muted;
  }
}

// Score (-100..100) -> color for the parameter bars.
export function scoreColor(score) {
  const n = Number(score);
  if (n > 5) return PALETTE.bullish;
  if (n < -5) return PALETTE.bearish;
  return PALETTE.muted;
}
