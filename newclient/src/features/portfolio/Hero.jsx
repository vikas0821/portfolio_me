import { motion } from "framer-motion";
import { ArrowUpRight, Download, Mail, Github, Linkedin } from "lucide-react";
import profileImg from "../../assets/images/hellon.png";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] },
});

const Hero = ({ hero = {}, settings = {}, onDownloadResume }) => {
  const h = settings.hero || {};
  const first = hero.name?.split(" ")[0] || "Vikas";
  const last = hero.name?.split(" ").slice(1).join(" ") || "Kannaujiya";

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden bg-white dark:bg-[#050505] px-6">
      {/* faint ambient wash — calm, not loud */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-accent/5 dark:bg-accent/8 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto w-full pt-28 pb-20">
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-12 lg:gap-16 items-center">
          {/* Text */}
          <div className="order-2 lg:order-1">
            <motion.div {...fadeUp(0.05)} className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              {h.badge || "Available for opportunities"}
            </motion.div>

            <motion.h1 {...fadeUp(0.12)} className="text-5xl md:text-7xl font-bold leading-[1.02] tracking-tight text-slate-900 dark:text-white">
              {first}<br />
              <span className="text-accent">{last}</span>
            </motion.h1>

            <motion.p {...fadeUp(0.2)} className="mt-6 text-lg md:text-xl font-medium text-slate-700 dark:text-slate-200">
              {hero.role || "Senior Backend Engineer"}
              {hero.location && <span className="text-slate-400 dark:text-slate-500 font-normal"> — {hero.location}</span>}
            </motion.p>

            <motion.p {...fadeUp(0.28)} className="mt-6 max-w-xl text-base md:text-lg leading-relaxed text-slate-500 dark:text-slate-400">
              {hero.summary || "I build secure, high-performance Node.js backends for fintech and banking — microservices, clean APIs, and cloud-native systems at scale."}
            </motion.p>

            {/* CTAs */}
            <motion.div {...fadeUp(0.36)} className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <button
                onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
                className="group inline-flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white border-b-2 border-accent pb-1 hover:text-accent transition-colors"
              >
                {h.ctaPrimaryLabel || "View projects"}
                <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
              <button
                onClick={onDownloadResume}
                className="inline-flex items-center gap-2 text-base font-medium text-slate-500 dark:text-slate-400 hover:text-accent transition-colors"
              >
                <Download size={17} /> {h.ctaSecondaryLabel || "Résumé"}
              </button>
            </motion.div>

            {/* Social — editorial text links */}
            <motion.div {...fadeUp(0.44)} className="mt-12 flex items-center gap-6 text-sm">
              {hero.email && (
                <a href={`mailto:${hero.email}`} className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-accent transition-colors">
                  <Mail size={15} /> Email
                </a>
              )}
              {hero.github && (
                <a href={hero.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-accent transition-colors">
                  <Github size={15} /> GitHub
                </a>
              )}
              {hero.linkedin && (
                <a href={hero.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-accent transition-colors">
                  <Linkedin size={15} /> LinkedIn
                </a>
              )}
            </motion.div>
          </div>

          {/* Photo — clean editorial frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
            className="order-1 lg:order-2 flex justify-center lg:justify-end"
          >
            <div className="relative w-56 sm:w-64 lg:w-full max-w-sm">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl shadow-black/10">
                <img src={profileImg} alt={hero.name || "Vikas Kannaujiya"} className="w-full h-full object-cover object-top" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* minimal scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[11px] uppercase tracking-[0.3em] text-slate-400 dark:text-slate-600"
      >
        Scroll
      </motion.div>
    </section>
  );
};

export default Hero;
