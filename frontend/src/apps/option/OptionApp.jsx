import { useMemo } from "react";
import App from "./App.jsx";
import { LearnProvider } from "./context/LearnContext.jsx";
import { optionThemeTokens, hexToChannels } from "./theme/themes.js";
import { applyPalette } from "./utils/colors.js";
import { useTheme } from "../../context/ThemeContext";
import "./index.css";

// Mounts the Option Analyzer inside the portfolio. Its color tokens follow the
// global light/dark theme: CSS vars (for Tailwind `bg-card`, `text-txt`, …) are
// set inline on .option-root, and the chart PALETTE (hex) is kept in sync.
export default function OptionApp() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const styleVars = useMemo(() => {
    const tokens = optionThemeTokens(isDark);
    applyPalette(tokens); // charts read hex from PALETTE
    const vars = { colorScheme: isDark ? "dark" : "light" };
    for (const [k, v] of Object.entries(tokens)) vars[`--c-${k}`] = hexToChannels(v);
    return vars;
  }, [isDark]);

  return (
    <div className="option-root" style={styleVars}>
      <LearnProvider>
        <App />
      </LearnProvider>
    </div>
  );
}
