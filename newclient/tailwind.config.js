import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        accent: "rgb(var(--accent-rgb) / <alpha-value>)",
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
