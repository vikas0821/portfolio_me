// Convert a hex color (#rrggbb or #rgb) to "r g b" channels for CSS rgb(var(--accent-rgb) / a)
export function hexToRgbChannels(hex) {
  if (!hex) return null;
  let h = String(hex).replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

// Apply an accent color at runtime by setting the CSS variable on :root
export function applyAccent(hex) {
  const ch = hexToRgbChannels(hex);
  if (ch) {
    document.documentElement.style.setProperty("--accent-rgb", ch);
    try { localStorage.setItem("accentColor", hex); } catch { /* ignore */ }
  }
}

// Apply the last-known accent immediately on app start (avoids a flash and keeps
// secondary pages like /blog in sync before data loads).
export function initAccent() {
  try {
    const saved = localStorage.getItem("accentColor");
    if (saved) applyAccent(saved);
  } catch { /* ignore */ }
}
