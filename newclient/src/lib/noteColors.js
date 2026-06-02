// Sticky-note color palette. Class strings are literal so Tailwind picks them up.
export const NOTE_COLORS = {
  yellow: { card: "bg-amber-50 dark:bg-amber-500/10 border-amber-200/70 dark:border-amber-500/25", dot: "bg-amber-400", swatch: "bg-amber-300" },
  green:  { card: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200/70 dark:border-emerald-500/25", dot: "bg-emerald-400", swatch: "bg-emerald-300" },
  blue:   { card: "bg-sky-50 dark:bg-sky-500/10 border-sky-200/70 dark:border-sky-500/25", dot: "bg-sky-400", swatch: "bg-sky-300" },
  pink:   { card: "bg-pink-50 dark:bg-pink-500/10 border-pink-200/70 dark:border-pink-500/25", dot: "bg-pink-400", swatch: "bg-pink-300" },
  purple: { card: "bg-violet-50 dark:bg-violet-500/10 border-violet-200/70 dark:border-violet-500/25", dot: "bg-violet-400", swatch: "bg-violet-300" },
  orange: { card: "bg-orange-50 dark:bg-orange-500/10 border-orange-200/70 dark:border-orange-500/25", dot: "bg-orange-400", swatch: "bg-orange-300" },
};

export const NOTE_COLOR_KEYS = Object.keys(NOTE_COLORS);
export const noteColor = (key) => NOTE_COLORS[key] || NOTE_COLORS.yellow;
