import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  THEMES,
  applyThemeVars,
  getInitialThemeKey,
  persistThemeKey,
} from "../theme/themes.js";
import { applyPalette } from "../utils/colors.js";

// Holds the education UI state: Beginner Mode (persisted) and which glossary
// entry the modal should open to.
const LearnContext = createContext(null);

const STORAGE_KEY = "oca_beginner_mode";
const LANG_KEY = "oca_lang";

export function LearnProvider({ children }) {
  const [beginner, setBeginner] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });

  // Teaching-content language: "hi" (default) | "en".
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem(LANG_KEY) === "en" ? "en" : "hi";
    } catch {
      return "hi";
    }
  });

  // Active color theme key (see theme/themes.js).
  const [theme, setThemeState] = useState(() => getInitialThemeKey());

  // Apply synchronously so the next render's inline/chart colors are fresh.
  function setTheme(key) {
    if (!THEMES[key]) return;
    const t = applyThemeVars(key); // CSS variables for Tailwind classes
    applyPalette(t.tokens); // hex PALETTE for charts/inline styles
    persistThemeKey(key);
    setThemeState(key);
  }

  // `glossary` holds the open state: null = closed, "" = library home,
  // or a specific entry key to deep-link into.
  const [glossary, setGlossary] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, beginner ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [beginner]);

  useEffect(() => {
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      /* ignore */
    }
  }, [lang]);

  const value = useMemo(
    () => ({
      beginner,
      toggleBeginner: () => setBeginner((b) => !b),
      setBeginner,
      lang,
      setLang,
      toggleLang: () => setLang((l) => (l === "hi" ? "en" : "hi")),
      theme,
      setTheme,
      themes: THEMES,
      glossaryOpen: glossary !== null,
      glossaryKey: glossary || null,
      openGlossary: (key = "") => setGlossary(key),
      closeGlossary: () => setGlossary(null),
    }),
    [beginner, lang, theme, glossary]
  );

  return <LearnContext.Provider value={value}>{children}</LearnContext.Provider>;
}

export function useLearn() {
  const ctx = useContext(LearnContext);
  if (!ctx) {
    // Safe fallback so components never crash if used outside the provider.
    return {
      beginner: false,
      toggleBeginner: () => {},
      setBeginner: () => {},
      lang: "hi",
      setLang: () => {},
      toggleLang: () => {},
      theme: "midnight",
      setTheme: () => {},
      themes: THEMES,
      glossaryOpen: false,
      glossaryKey: null,
      openGlossary: () => {},
      closeGlossary: () => {},
    };
  }
  return ctx;
}
