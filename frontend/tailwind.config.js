import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "monospace"],
      },
      colors: {
        accent: "rgb(var(--accent-rgb) / <alpha-value>)",
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
      },
    },
  },

  plugins: [daisyui],

  daisyui: {
    themes: false,
    base: false,
  },
};
