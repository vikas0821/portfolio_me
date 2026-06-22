import { useEffect } from "react";
import App from "./App.jsx";
import { LearnProvider } from "./context/LearnContext.jsx";
import { applyThemeVars, getInitialThemeKey } from "./theme/themes.js";
import "./index.css";

// Mounts the Option Analyzer as a self-contained component inside the portfolio.
// Theme CSS variables are applied on mount; styles are scoped under .option-root.
export default function OptionApp() {
  useEffect(() => { applyThemeVars(getInitialThemeKey()); }, []);
  return (
    <div className="option-root">
      <LearnProvider>
        <App />
      </LearnProvider>
    </div>
  );
}
