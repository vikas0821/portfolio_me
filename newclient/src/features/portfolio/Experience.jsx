import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import SectionHeader from "./SectionHeader";

const ExperienceRow = ({ exp, index }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
      className="grid md:grid-cols-12 gap-x-8 gap-y-4 py-10 md:py-12 border-b border-slate-200 dark:border-white/10"
    >
      {/* Left rail — period, company, location */}
      <div className="md:col-span-4">
        {exp.period && (
          <p className="text-sm font-medium tabular-nums text-slate-400 dark:text-slate-500">{exp.period}</p>
        )}
        <h3 className="mt-2 text-xl font-bold text-slate-900 dark:text-white leading-snug">{exp.company}</h3>
        {exp.location && (
          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">{exp.location}</p>
        )}
      </div>

      {/* Right — role, responsibilities, tech */}
      <div className="md:col-span-8">
        <p className="text-accent font-semibold">{exp.role}</p>

        {exp.responsibilities?.length > 0 && (
          <ul className="mt-4 space-y-2.5">
            {exp.responsibilities.map((r, i) => (
              <li key={i} className="flex gap-3 text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">
                <span className="text-accent select-none mt-px">—</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        )}

        {exp.technologies?.length > 0 && (
          <p className="mt-5 text-sm text-slate-400 dark:text-slate-500 leading-relaxed">
            {exp.technologies.join("  ·  ")}
          </p>
        )}
      </div>
    </motion.div>
  );
};

const Experience = ({ experience = [], meta }) => {
  return (
    <section id="experience" className="scroll-mt-20 py-24 md:py-32 px-6 bg-slate-50/80 dark:bg-zinc-950">
      <div className="max-w-5xl mx-auto">
        <SectionHeader
          meta={meta}
          eyebrow="Career"
          heading="Experience"
          subtitle="Building and shipping production systems across fintech and banking."
        />

        {experience.length === 0 ? (
          <p className="text-slate-400 dark:text-slate-500 py-12">No experience added yet.</p>
        ) : (
          <div className="border-t border-slate-200 dark:border-white/10">
            {experience.map((exp, i) => (
              <ExperienceRow key={exp._id || i} exp={exp} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Experience;
