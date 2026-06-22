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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white flex items-center justify-center px-4">
      <button onClick={toggleTheme} aria-label="Toggle theme"
        className="absolute top-4 right-4 p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition text-sm">
        {theme === "light" ? "🌙" : "☀️"}
      </button>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 mb-4 text-accent">
            {icon || <Lock size={24} />}
          </div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{subtitle}</p>}
        </div>
        <form onSubmit={submit} className="bg-white dark:bg-[#141414] border border-slate-200 dark:border-white/8 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type={show ? "text" : "password"}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Password"
              required
              className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-slate-50 dark:bg-[#0f0f0f] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 text-sm"
            />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg bg-accent text-white font-semibold text-sm hover:bg-accent/90 active:scale-95 transition disabled:opacity-50">
            {loading ? "…" : "Unlock"}
          </button>
        </form>
        <p className="text-center text-xs text-slate-500 dark:text-slate-600 mt-4">
          <Link to="/studio" className="inline-flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-400 transition"><ArrowLeft size={12} /> Back to workspace</Link>
        </p>
      </div>
    </div>
  );
}
