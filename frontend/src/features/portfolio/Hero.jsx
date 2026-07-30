import { motion } from "framer-motion";
import { Github, Linkedin, Mail, MapPin, Download, ArrowRight, Code2, Database, Server } from "lucide-react";
import profileImg from "../../assets/images/hellon.png";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.25, 0.1, 0.25, 1] },
});

const STAT_ICONS = [
  { icon: Server, label: "Backend", value: "Node.js · Express", bg: "bg-comic-yellow" },
  { icon: Database, label: "Data", value: "MongoDB · Redis", bg: "bg-comic-blue" },
  { icon: Code2, label: "Cloud", value: "AWS · Docker · K8s", bg: "bg-comic-pink" },
];

const Hero = ({ hero = {}, settings = {}, onDownloadResume }) => {
  const h = settings.hero || {};
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden bg-paper halftone-bg"
    >
      {/* Big soft color blobs behind the halftone, comic-style */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 right-[-120px] w-[520px] h-[520px] bg-comic-yellow/40 dark:bg-comic-yellow/15 rounded-full blur-[10px] rotate-12" />
        <div className="absolute bottom-[-140px] left-[-100px] w-[440px] h-[440px] bg-comic-blue/25 dark:bg-comic-blue/15 rounded-full blur-[10px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* Left — Text */}
          <div className="order-2 lg:order-1">
            <motion.div {...fadeUp(0.1)} className="inline-block -rotate-2 mb-7">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-comic-green border-[3px] border-ink rounded-full shadow-comic-sm text-xs font-bold text-ink uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-ink animate-pulse" />
                {h.badge || "Available for opportunities"}
              </span>
            </motion.div>

            <motion.h1
              {...fadeUp(0.2)}
              className="font-display uppercase leading-[0.95] tracking-wide text-6xl md:text-7xl xl:text-8xl"
            >
              <span
                className="block text-ink dark:text-white"
                style={{ textShadow: "5px 5px 0 rgb(var(--accent-rgb))" }}
              >
                {hero.name?.split(" ")[0] || "Vikas"}
              </span>
              <span className="relative inline-block mt-1">
                <span className="absolute -inset-x-2 top-[38%] h-[46%] -rotate-1 bg-comic-yellow -z-10" />
                <span className="text-ink dark:text-white">
                  {hero.name?.split(" ").slice(1).join(" ") || "Kannaujiya"}
                </span>
              </span>
            </motion.h1>

            <motion.div {...fadeUp(0.3)} className="flex flex-wrap items-center gap-2.5 mt-6">
              <span className="px-3 py-1.5 rounded-lg bg-comic-blue/90 border-2 border-ink text-white font-bold text-sm rotate-1">
                {hero.role || "Full Stack Developer"}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-ink text-ink/80 dark:text-white/80 dark:border-white/60 text-xs font-bold -rotate-1">
                <MapPin size={13} /> {hero.location || "India"}
              </span>
            </motion.div>

            {/* Bio as a speech bubble, pointing toward the photo */}
            <motion.div {...fadeUp(0.4)} className="mt-8">
              <div className="speech-bubble px-6 py-5 max-w-xl shadow-comic">
                <p className="font-sans text-base md:text-lg leading-relaxed text-ink dark:text-white/90">
                  {hero.summary || "Building scalable backend systems and polished UIs. Passionate about clean code, performance, and developer experience."}
                </p>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div {...fadeUp(0.5)} className="mt-10 flex flex-wrap gap-4">
              <button
                onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
                className="wobble-hover inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-accent border-[3px] border-ink text-white font-display text-lg tracking-wide shadow-comic active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-150"
              >
                {h.ctaPrimaryLabel || "View Projects"} <ArrowRight size={19} />
              </button>
              <button
                onClick={onDownloadResume}
                className="wobble-hover inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-comic-yellow border-[3px] border-ink text-ink font-display text-lg tracking-wide shadow-comic-sm active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-150"
              >
                <Download size={18} /> {h.ctaSecondaryLabel || "Download Resume"}
              </button>
            </motion.div>

            {/* Social links */}
            <motion.div {...fadeUp(0.6)} className="mt-9 flex items-center gap-3">
              <span className="text-xs text-ink/50 dark:text-white/50 uppercase tracking-wider font-bold">Find me on</span>
              <div className="flex items-center gap-2.5">
                {hero.github && (
                  <a href={hero.github} target="_blank" rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-paper border-2 border-ink dark:border-white/70 text-ink dark:text-white/80 hover:bg-comic-yellow hover:-rotate-6 transition-all duration-200 shadow-comic-sm">
                    <Github size={18} />
                  </a>
                )}
                {hero.linkedin && (
                  <a href={hero.linkedin} target="_blank" rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-paper border-2 border-ink dark:border-white/70 text-ink dark:text-white/80 hover:bg-comic-blue hover:text-white hover:rotate-6 transition-all duration-200 shadow-comic-sm">
                    <Linkedin size={18} />
                  </a>
                )}
                {hero.email && (
                  <a href={`mailto:${hero.email}`}
                    className="p-2.5 rounded-xl bg-paper border-2 border-ink dark:border-white/70 text-ink dark:text-white/80 hover:bg-comic-pink hover:text-white hover:-rotate-6 transition-all duration-200 shadow-comic-sm">
                    <Mail size={18} />
                  </a>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right — Photo panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -6 }}
            animate={{ opacity: 1, scale: 1, rotate: -3 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
            className="order-1 lg:order-2 flex justify-center"
          >
            <div className="relative">
              {/* Photo panel — taped-in comic-panel look */}
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-[28px] overflow-hidden border-[5px] border-ink dark:border-white/85 shadow-comic-lg bg-white">
                <img
                  src={profileImg}
                  alt={hero.name || "Vikas Kannaujiya"}
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 halftone-bg opacity-30 mix-blend-multiply pointer-events-none" />
              </div>

              {/* "Tape" corners */}
              <div className="absolute -top-3 left-10 w-16 h-6 bg-comic-yellow/80 border-2 border-ink rotate-6" />
              <div className="absolute -bottom-3 right-10 w-16 h-6 bg-comic-pink/80 border-2 border-ink -rotate-3" />

              {/* Stack pills */}
              {STAT_ICONS.map(({ icon: Icon, label, value, bg }, i) => {
                const positions = [
                  "top-4 -right-10 md:-right-16 rotate-6",
                  "bottom-1/3 -right-10 md:-right-20 -rotate-3",
                  "-bottom-4 -left-6 md:-left-12 rotate-3",
                ];
                return (
                  <motion.div
                    key={label}
                    animate={{ y: [0, i % 2 === 0 ? -6 : 6, 0] }}
                    transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
                    className={`hidden lg:block absolute ${positions[i]} bg-paper border-[3px] border-ink rounded-2xl px-3.5 py-2.5 shadow-comic-sm`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg ${bg} border-2 border-ink flex items-center justify-center flex-shrink-0`}>
                        <Icon size={14} className="text-ink" />
                      </div>
                      <div>
                        <p className="text-[10px] text-ink/50 dark:text-white/50 leading-none font-bold">{label}</p>
                        <p className="text-xs font-bold text-ink dark:text-white leading-tight mt-0.5">{value}</p>
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
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
      >
        <span className="font-display text-sm tracking-widest text-ink/60 dark:text-white/60">SCROLL</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          className="text-ink/60 dark:text-white/60"
        >
          ▼
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
