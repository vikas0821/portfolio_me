import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

// Reusable, settings-driven section header. `meta` comes from Site Settings;
// eyebrow/heading/subtitle props are the built-in fallbacks.
const SectionHeader = ({ meta = {}, eyebrow, heading, subtitle }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const e = (meta?.eyebrow ?? "") || eyebrow;
  const h = (meta?.heading ?? "") || heading;
  const s = (meta?.subtitle ?? "") || subtitle;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="relative text-center mb-16"
    >
      {e && (
        <div className="inline-block -rotate-2 mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-comic-yellow border-[3px] border-ink dark:border-white/85 rounded-full shadow-comic-sm text-xs font-bold text-ink uppercase tracking-widest">
            ★ {e}
          </span>
        </div>
      )}
      <h2
        className="relative text-5xl md:text-6xl font-display uppercase tracking-wide text-ink dark:text-white px-2"
        style={{ textShadow: "4px 4px 0 rgb(var(--accent-rgb))" }}
      >
        {h}
      </h2>
      <div className="mx-auto mt-5 h-2.5 w-24 rotate-1 rounded-full bg-comic-red border-2 border-ink dark:border-white/70" />
      {s && (
        <p className="relative mt-5 text-ink/70 dark:text-white/70 max-w-lg mx-auto leading-relaxed font-sans">{s}</p>
      )}
    </motion.div>
  );
};

export default SectionHeader;
