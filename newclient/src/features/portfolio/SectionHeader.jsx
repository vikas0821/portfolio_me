import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

// Editorial section masthead: left-aligned eyebrow + large heading, a hairline
// rule, an optional running count on the right, and a roomy subtitle below.
const SectionHeader = ({ meta = {}, eyebrow, heading, subtitle, count }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const e = (meta?.eyebrow ?? "") || eyebrow;
  const h = (meta?.heading ?? "") || heading;
  const s = (meta?.subtitle ?? "") || subtitle;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="mb-14 md:mb-20"
    >
      <div className="flex items-end justify-between gap-6 border-b border-slate-200 dark:border-white/10 pb-6">
        <div>
          {e && (
            <span className="block text-[11px] font-semibold uppercase tracking-[0.25em] text-accent">{e}</span>
          )}
          <h2 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">{h}</h2>
        </div>
        {count != null && (
          <span className="hidden sm:block text-sm font-medium tabular-nums text-slate-400 dark:text-slate-600 pb-1.5">
            {count}
          </span>
        )}
      </div>
      {s && (
        <p className="mt-6 max-w-2xl text-base md:text-lg text-slate-500 dark:text-slate-400 leading-relaxed">{s}</p>
      )}
    </motion.div>
  );
};

export default SectionHeader;
