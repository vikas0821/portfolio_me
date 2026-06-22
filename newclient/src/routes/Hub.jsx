import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Newspaper, StickyNote, FileText, LineChart, Settings, Lock, ArrowUpRight } from "lucide-react";

const CARDS = [
  { to: "/portfolio", title: "Portfolio", desc: "My work, experience, skills & projects.", icon: User, grad: "from-indigo-500 to-violet-600", locked: false },
  { to: "/blog", title: "Blog", desc: "Writing, notes & technical write-ups.", icon: Newspaper, grad: "from-sky-500 to-cyan-600", locked: false },
  { to: "/notes", title: "Notes", desc: "Private Notion-style workspace.", icon: StickyNote, grad: "from-amber-500 to-orange-600", locked: true },
  { to: "/resume-builder", title: "Resume Builder", desc: "Build, tailor & export resumes (ATS).", icon: FileText, grad: "from-emerald-500 to-teal-600", locked: true },
  { to: "/option-analysis", title: "Option Analysis", desc: "NSE option-chain analyzer & signals.", icon: LineChart, grad: "from-rose-500 to-pink-600", locked: true },
  { to: "/admin", title: "Admin", desc: "Manage all site content.", icon: Settings, grad: "from-slate-600 to-slate-800", locked: true },
];

export default function Hub() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-white flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden">
      {/* ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[100px]" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight">
          Vikas <span className="bg-gradient-to-r from-indigo-500 via-accent to-violet-500 bg-clip-text text-transparent">Kannaujiya</span>
        </h1>
        <p className="mt-3 text-slate-500 dark:text-slate-400">One place for everything I build. Pick a destination.</p>
      </motion.div>

      <div className="relative grid sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-5xl">
        {CARDS.map((c, i) => (
          <motion.div key={c.to} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: i * 0.07 }}>
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
                  {c.locked && <Lock size={13} className="text-slate-400 group-hover:text-white/80" />}
                  <ArrowUpRight size={16} className="ml-auto text-slate-300 dark:text-slate-600 group-hover:text-white transition-colors" />
                </div>
                <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 group-hover:text-white/85 transition-colors">{c.desc}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <p className="relative mt-12 text-xs text-slate-400 dark:text-slate-600">🔒 sections are password-protected</p>
    </div>
  );
}
