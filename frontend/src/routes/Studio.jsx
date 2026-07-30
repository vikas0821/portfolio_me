import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  StickyNote, FileText, LineChart, Settings, Lock, ArrowUpRight, ArrowLeft, User, Newspaper,
} from "lucide-react";

// Private tools (owner-only, password-gated)
const TOOLS = [
  { to: "/notes", title: "Notes", desc: "Private Notion-style workspace.", icon: StickyNote, bg: "bg-comic-yellow" },
  { to: "/resume-builder", title: "Resume Builder", desc: "Build, tailor & export resumes (ATS).", icon: FileText, bg: "bg-comic-green" },
  { to: "/option-analysis", title: "Option Analysis", desc: "NSE option-chain analyzer & signals.", icon: LineChart, bg: "bg-comic-pink" },
  { to: "/admin", title: "Admin", desc: "Manage all site content.", icon: Settings, bg: "bg-comic-blue" },
];

// Public pages (no gate) — quick links back into the live site
const PUBLIC = [
  { to: "/", title: "Portfolio", desc: "The live public site.", icon: User },
  { to: "/blog", title: "Blog", desc: "Published writing.", icon: Newspaper },
];

function ToolCard({ c, i }) {
  const rotate = i % 2 === 0 ? "-rotate-1" : "rotate-1";
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.06 }}>
      <Link
        to={c.to}
        className={`comic-panel group relative block h-full p-6 ${rotate} hover:rotate-0`}
      >
        <div className={`w-12 h-12 rounded-xl ${c.bg} border-[3px] border-ink flex items-center justify-center text-ink mb-4 group-hover:-rotate-12 transition-transform duration-300`}>
          <c.icon size={22} />
        </div>
        <div className="flex items-center gap-2">
          <h2 className="font-display text-xl tracking-wide text-ink dark:text-white">{c.title}</h2>
          <Lock size={13} className="text-ink/40 dark:text-white/40" />
          <ArrowUpRight size={16} className="ml-auto text-ink/30 dark:text-white/30 group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </div>
        <p className="mt-1.5 text-sm text-ink/60 dark:text-white/60 font-sans">{c.desc}</p>
      </Link>
    </motion.div>
  );
}

export default function Studio() {
  return (
    <div className="min-h-screen bg-paper halftone-bg text-ink dark:text-white px-6 py-14 relative overflow-hidden">
      <div className="relative max-w-5xl mx-auto">
        <Link to="/" className="wobble-hover inline-flex items-center gap-1.5 text-sm font-bold text-ink/70 dark:text-white/70 hover:text-accent transition mb-8">
          <ArrowLeft size={15} /> Public site
        </Link>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="mb-10">
          <div className="inline-block -rotate-2 mb-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-comic-yellow border-[3px] border-ink rounded-full shadow-comic-sm text-xs font-bold text-ink uppercase tracking-wider">
              <Lock size={12} /> Private workspace
            </span>
          </div>
          <h1
            className="text-4xl md:text-5xl font-display uppercase tracking-wide text-ink dark:text-white"
            style={{ textShadow: "4px 4px 0 rgb(var(--accent-rgb))" }}
          >
            Studio
          </h1>
          <p className="mt-3 text-ink/60 dark:text-white/60 font-sans">Your owner-only tools. Each is password-protected.</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {TOOLS.map((c, i) => <ToolCard key={c.to} c={c} i={i} />)}
        </div>

        <h2 className="mt-14 mb-4 font-display text-sm tracking-widest text-ink/50 dark:text-white/50">PUBLIC PAGES</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {PUBLIC.map((c, i) => (
            <Link key={c.to} to={c.to}
              className={`comic-panel group flex items-center gap-3 p-4 ${i % 2 === 0 ? "rotate-1" : "-rotate-1"} hover:rotate-0`}>
              <div className="w-9 h-9 rounded-lg bg-comic-blue/20 border-2 border-ink flex items-center justify-center flex-shrink-0"><c.icon size={17} /></div>
              <div>
                <p className="font-bold text-sm text-ink dark:text-white">{c.title}</p>
                <p className="text-xs text-ink/60 dark:text-white/60 font-sans">{c.desc}</p>
              </div>
              <ArrowUpRight size={15} className="ml-auto flex-shrink-0 text-ink/30 dark:text-white/30 group-hover:text-accent transition" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
