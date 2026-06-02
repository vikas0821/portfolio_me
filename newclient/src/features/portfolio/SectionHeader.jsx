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
      className="text-center mb-16"
    >
      {e && (
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          <span className="text-xs font-semibold text-accent uppercase tracking-widest">{e}</span>
        </div>
      )}
      <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">{h}</h2>
      {s && (
        <p className="mt-4 text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">{s}</p>
      )}
    </motion.div>
  );
};

export default SectionHeader;
