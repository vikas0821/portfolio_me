import { motion } from "framer-motion";
import { Github, Linkedin, Mail, MapPin, Download, ArrowRight, Code2, Database, Server } from "lucide-react";
import profileImg from "../../assets/images/hellon.png";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.25, 0.1, 0.25, 1] },
});

const STAT_ICONS = [
  { icon: Code2, label: "Frontend", value: "React, Next.js" },
  { icon: Server, label: "Backend", value: "Node.js, Express" },
  { icon: Database, label: "Database", value: "MongoDB, SQL" },
];

const Hero = ({ hero = {}, settings = {}, onDownloadResume }) => {
  const h = settings.hero || {};
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden bg-white dark:bg-[#050505]"
    >
      {/* Mesh gradient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/6 dark:bg-accent/8 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/5 dark:bg-indigo-500/8 rounded-full blur-[100px] -translate-x-1/4 translate-y-1/4" />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-violet-500/3 dark:bg-violet-500/5 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 pt-28 pb-20">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Left — Text */}
          <div className="order-2 lg:order-1">
            <motion.div
              {...fadeUp(0.1)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-accent/10 dark:bg-accent/12 text-accent border border-accent/25 mb-8 uppercase tracking-wider"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              {h.badge || "Available for opportunities"}
            </motion.div>

            <motion.h1
              {...fadeUp(0.2)}
              className="text-5xl md:text-6xl xl:text-7xl font-black leading-[1.05] tracking-tight"
            >
              <span className="text-slate-900 dark:text-white block">
                {hero.name?.split(" ")[0] || "Vikas"}
              </span>
              <span className="bg-gradient-to-r from-indigo-500 via-accent to-violet-500 bg-clip-text text-transparent block">
                {hero.name?.split(" ").slice(1).join(" ") || "Kannaujiya"}
              </span>
            </motion.h1>

            <motion.div {...fadeUp(0.3)} className="flex flex-wrap items-center gap-3 mt-5">
              <span className="text-lg md:text-xl font-semibold text-slate-700 dark:text-slate-200">
                {hero.role || "Full Stack Developer"}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-400" />
              <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                <MapPin size={14} className="text-accent" />
                {hero.location || "India"}
              </span>
            </motion.div>

            <motion.p
              {...fadeUp(0.4)}
              className="mt-6 text-base md:text-lg leading-relaxed text-slate-600 dark:text-slate-400 max-w-xl"
            >
              {hero.summary || "Building scalable backend systems and polished UIs. Passionate about clean code, performance, and developer experience."}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div {...fadeUp(0.5)} className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-accent text-white font-bold hover:bg-accent/90 active:scale-95 transition-all duration-200 shadow-lg shadow-accent/30"
              >
                {h.ctaPrimaryLabel || "View Projects"} <ArrowRight size={17} />
              </button>
              <button
                onClick={onDownloadResume}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-slate-300 dark:border-white/12 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-100 dark:hover:bg-white/5 active:scale-95 transition-all duration-200"
              >
                <Download size={17} /> {h.ctaSecondaryLabel || "Download Resume"}
              </button>
            </motion.div>

            {/* Social links */}
            <motion.div {...fadeUp(0.6)} className="mt-8 flex items-center gap-3">
              <span className="text-xs text-slate-400 dark:text-slate-600 uppercase tracking-wider font-medium">Find me on</span>
              <div className="flex items-center gap-2">
                {hero.github && (
                  <a href={hero.github} target="_blank" rel="noopener noreferrer"
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-accent hover:border-accent/40 dark:hover:border-accent/30 hover:bg-accent/5 transition-all duration-200">
                    <Github size={18} />
                  </a>
                )}
                {hero.linkedin && (
                  <a href={hero.linkedin} target="_blank" rel="noopener noreferrer"
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-accent hover:border-accent/40 dark:hover:border-accent/30 hover:bg-accent/5 transition-all duration-200">
                    <Linkedin size={18} />
                  </a>
                )}
                {hero.email && (
                  <a href={`mailto:${hero.email}`}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-accent hover:border-accent/40 dark:hover:border-accent/30 hover:bg-accent/5 transition-all duration-200">
                    <Mail size={18} />
                  </a>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right — Photo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
            className="order-1 lg:order-2 flex justify-center"
          >
            <div className="relative">
              {/* Glow */}
              <div className="absolute -inset-6 bg-gradient-to-br from-accent/20 to-violet-500/10 rounded-full blur-3xl" />

              {/* Orbit ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-4 rounded-full border border-dashed border-accent/20"
              />

              {/* Photo */}
              <div className="relative w-72 h-72 md:w-88 md:h-88 rounded-full overflow-hidden border-4 border-white/90 dark:border-white/8 shadow-2xl shadow-black/30">
                <img
                  src={profileImg}
                  alt={hero.name || "Vikas Kannaujiya"}
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              {/* Stack pills */}
              {STAT_ICONS.map(({ icon: Icon, label, value }, i) => {
                const positions = [
                  "top-2 -right-12 md:-right-16",
                  "bottom-1/3 -right-14 md:-right-20",
                  "-bottom-2 -left-8 md:-left-12",
                ];
                return (
                  <motion.div
                    key={label}
                    animate={{ y: [0, i % 2 === 0 ? -6 : 6, 0] }}
                    transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
                    className={`absolute ${positions[i]} bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-2xl px-3.5 py-2.5 shadow-xl`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-accent/12 flex items-center justify-center flex-shrink-0">
                        <Icon size={14} className="text-accent" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-none">{label}</p>
                        <p className="text-xs font-semibold text-slate-800 dark:text-white leading-tight mt-0.5">{value}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[11px] text-slate-400 dark:text-slate-600 uppercase tracking-widest font-medium">Scroll</span>
        <div className="relative w-5 h-8 border border-slate-300 dark:border-white/15 rounded-full flex justify-center pt-1.5">
          <motion.div
            animate={{ y: [0, 10, 0], opacity: [1, 0, 1] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="w-1 h-1.5 bg-accent rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
