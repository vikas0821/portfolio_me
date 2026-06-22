import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  StickyNote, FileText, LineChart, Settings, Lock, ArrowUpRight, ArrowLeft, User, Newspaper,
} from "lucide-react";

// Private tools (owner-only, password-gated)
const TOOLS = [
  { to: "/notes", title: "Notes", desc: "Private Notion-style workspace.", icon: StickyNote, grad: "from-amber-500 to-orange-600" },
  { to: "/resume-builder", title: "Resume Builder", desc: "Build, tailor & export resumes (ATS).", icon: FileText, grad: "from-emerald-500 to-teal-600" },
  { to: "/option-analysis", title: "Option Analysis", desc: "NSE option-chain analyzer & signals.", icon: LineChart, grad: "from-rose-500 to-pink-600" },
  { to: "/admin", title: "Admin", desc: "Manage all site content.", icon: Settings, grad: "from-slate-600 to-slate-800" },
];

// Public pages (no gate) — quick links back into the live site
const PUBLIC = [
  { to: "/", title: "Portfolio", desc: "The live public site.", icon: User },
  { to: "/blog", title: "Blog", desc: "Published writing.", icon: Newspaper },
];

function ToolCard({ c, i }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.06 }}>
      <Link
        to={c.to}
        className="group relative block h-full rounded-2xl p-6 bg-white dark:bg-[#141414] border border-slate-200 dark:border-white/10 hover:border-transparent shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden"
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${c.grad} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
        <div className="relative">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.grad} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
            <c.icon size={22} />
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold group-hover:text-white transition-colors">{c.title}</h2>
            <Lock size={13} className="text-slate-400 group-hover:text-white/80" />
            <ArrowUpRight size={16} className="ml-auto text-slate-300 dark:text-slate-600 group-hover:text-white transition-colors" />
          </div>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 group-hover:text-white/85 transition-colors">{c.desc}</p>
        </div>
      </Link>
    </motion.div>
  );
}

export default function Studio() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white px-6 py-14 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-5xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-accent transition mb-8">
          <ArrowLeft size={15} /> Public site
        </Link>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20 mb-3">
            <Lock size={12} /> Private workspace
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Studio</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Your owner-only tools. Each is password-protected.</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-5">
          {TOOLS.map((c, i) => <ToolCard key={c.to} c={c} i={i} />)}
        </div>

        <h2 className="mt-12 mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600">Public pages</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {PUBLIC.map((c) => (
            <Link key={c.to} to={c.to}
              className="group flex items-center gap-3 rounded-xl p-4 bg-white dark:bg-[#141414] border border-slate-200 dark:border-white/10 hover:border-accent/40 transition">
              <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center"><c.icon size={17} /></div>
              <div>
                <p className="font-semibold text-sm">{c.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{c.desc}</p>
              </div>
              <ArrowUpRight size={15} className="ml-auto text-slate-300 dark:text-slate-600 group-hover:text-accent transition" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
