import { useLayoutEffect, useMemo } from "react";
import App from "./App.jsx";
import { LearnProvider } from "./context/LearnContext.jsx";
import { optionThemeTokens, hexToChannels } from "./theme/themes.js";
import { applyPalette } from "./utils/colors.js";
import { useTheme } from "../../context/ThemeContext";
import "./index.css";

// Mounts the Option Analyzer inside the portfolio. Its color tokens follow the
// global light/dark theme: CSS vars (for Tailwind `bg-card`, `text-txt`, …) are
// set on the document root, and the chart PALETTE (hex) is kept in sync.
//
// These vars used to be set as an inline style on the local .option-root div
// instead of :root. That worked for normal content (a descendant of the div),
// but InfoTip's popover renders via createPortal(..., document.body) — which
// escapes that div's subtree entirely, so none of the --c-* vars were ever
// actually reachable there. It "looked" approximately fine only by lucky
// fallback coincidence (an unresolvable var() in a non-shorthand property like
// background-color quietly falls back to transparent, letting the page's own
// similarly-toned background show through) — any shorthand property (e.g.
// `border: 2px solid rgb(var(--c-border))`) is dropped entirely when the var
// is invalid, rendering as no border at all. Setting these on :root makes
// them reachable by inheritance everywhere, portals included.
export default function OptionApp() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const tokens = useMemo(() => optionThemeTokens(isDark), [isDark]);

  useLayoutEffect(() => {
    applyPalette(tokens); // charts read hex from PALETTE
    const root = document.documentElement;
    root.style.colorScheme = isDark ? "dark" : "light";
    for (const [k, v] of Object.entries(tokens)) {
      root.style.setProperty(`--c-${k}`, hexToChannels(v));
    }
    return () => {
      // Don't leak these into the rest of the site once the option app unmounts.
      root.style.removeProperty("color-scheme");
      for (const k of Object.keys(tokens)) root.style.removeProperty(`--c-${k}`);
    };
  }, [tokens, isDark]);

  return (
    <div className="option-root">
      <LearnProvider>
        <App />
      </LearnProvider>
    </div>
  );
}
