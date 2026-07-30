import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

// Reusable password gate for the embedded apps. Once unlocked it renders `children`.
// `onLogin(password)` should return the server response; the gate stores its `token`
// under `tokenKey` and calls optional `afterAuth(data)` for app-specific storage.
export default function AppGate({ title, subtitle, icon, tokenKey, onLogin, afterAuth, children }) {
  const [authed, setAuthed] = useState(() => !!localStorage.getItem(tokenKey));
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await onLogin(pw);
      if (r?.token) {
        localStorage.setItem(tokenKey, r.token);
        afterAuth?.(r);
        setAuthed(true);
        toast.success("Unlocked");
      } else toast.error("Invalid password");
    } catch {
      toast.error("Invalid password");
    } finally {
      setLoading(false);
    }
  };

  if (authed) return children;

  return (
    <div className="min-h-screen bg-paper halftone-bg text-ink dark:text-white flex items-center justify-center px-4">
      <button onClick={toggleTheme} aria-label="Toggle theme"
        className="absolute top-4 right-4 p-2 rounded-lg text-ink/60 dark:text-white/60 hover:bg-ink/5 dark:hover:bg-white/5 transition text-sm">
        {theme === "light" ? "🌙" : "☀️"}
      </button>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-comic-yellow border-[3px] border-ink shadow-comic-sm mb-4 -rotate-3 text-ink">
            {icon || <Lock size={24} />}
          </div>
          <h1
            className="font-display text-3xl uppercase tracking-wide text-ink dark:text-white"
            style={{ textShadow: "3px 3px 0 rgb(var(--accent-rgb))" }}
          >
            {title}
          </h1>
          {subtitle && <p className="text-ink/60 dark:text-white/60 text-sm mt-2 font-sans">{subtitle}</p>}
        </div>
        <form onSubmit={submit} className="comic-panel p-6 space-y-4">
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/50 dark:text-white/50" />
            <input
              type={show ? "text" : "password"}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Password"
              required
              className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-paper border-2 border-ink dark:border-white/60 text-ink dark:text-white placeholder:text-ink/40 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent/40 text-sm"
            />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/50 dark:text-white/50 hover:text-ink dark:hover:text-white">
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <button type="submit" disabled={loading} className="wobble-hover w-full py-2.5 rounded-lg bg-accent border-[3px] border-ink text-white font-display tracking-wide text-base shadow-comic-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50">
            {loading ? "…" : "Unlock"}
          </button>
        </form>
        <p className="text-center text-xs text-ink/50 dark:text-white/50 mt-4 font-sans">
          <Link to="/studio" className="inline-flex items-center gap-1 hover:text-accent transition"><ArrowLeft size={12} /> Back to workspace</Link>
        </p>
      </div>
    </div>
  );
}
