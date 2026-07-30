import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  theme: {
    extend: {
      fontFamily: {
        sans: ["Comic Neue", "Comic Sans MS", "ui-sans-serif", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "monospace"],
        display: ["Bangers", "Comic Sans MS", "cursive"],
      },
      colors: {
        accent: "rgb(var(--accent-rgb) / <alpha-value>)",
        ink: "#141118",
        paper: "rgb(var(--paper-rgb) / <alpha-value>)",
        "comic-yellow": "#FFD23F",
        "comic-red": "#FF3B30",
        "comic-blue": "#2F6FED",
        "comic-green": "#2BB673",
        "comic-pink": "#FF6FB5",
        // Option Analyzer theme tokens (CSS vars set at runtime, scoped to .option-root)
        bg: "rgb(var(--c-bg) / <alpha-value>)",
        card: "rgb(var(--c-card) / <alpha-value>)",
        border: "rgb(var(--c-border) / <alpha-value>)",
        bullish: "rgb(var(--c-bullish) / <alpha-value>)",
        bearish: "rgb(var(--c-bearish) / <alpha-value>)",
        neutral: "rgb(var(--c-neutral) / <alpha-value>)",
        warning: "rgb(var(--c-warning) / <alpha-value>)",
        txt: "rgb(var(--c-txt) / <alpha-value>)",
        muted: "rgb(var(--c-muted) / <alpha-value>)",
      },
      animation: {
        "spin-slow": "spin 3s linear infinite",
      },
      boxShadow: {
        "accent-glow": "0 4px 24px rgb(var(--accent-rgb) / 0.28)",
        "comic-sm": "3px 3px 0 #141118",
        comic: "6px 6px 0 #141118",
        "comic-lg": "9px 9px 0 #141118",
        "comic-accent": "6px 6px 0 rgb(var(--accent-rgb))",
      },
      rotate: {
        1.5: "1.5deg",
        2.5: "2.5deg",
      },
    },
  },

  plugins: [daisyui],

  daisyui: {
    themes: false,
    base: false,
  },
};
