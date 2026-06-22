import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import SectionHeader from "./SectionHeader";

const EduRow = ({ edu, index }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
      className="grid md:grid-cols-12 gap-x-8 gap-y-2 py-8 border-b border-slate-200 dark:border-white/10"
    >
      <div className="md:col-span-9">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{edu.qualification}</h3>
        <p className="mt-1 text-accent font-medium">{edu.institution}</p>
        {edu.location && (
          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">{edu.location}</p>
        )}
      </div>
      <div className="md:col-span-3 md:text-right flex items-start gap-4 md:flex-col md:gap-1 text-sm">
        {edu.year && <span className="font-medium tabular-nums text-slate-500 dark:text-slate-400">{edu.year}</span>}
        {edu.score && <span className="font-semibold text-accent">{edu.score}</span>}
      </div>
    </motion.div>
  );
};

const Education = ({ education = [], meta }) => {
  if (education.length === 0) return null;

  return (
    <section id="education" className="scroll-mt-20 py-24 md:py-32 px-6 bg-white dark:bg-[#050505]">
      <div className="max-w-5xl mx-auto">
        <SectionHeader
          meta={meta}
          eyebrow="Academics"
          heading="Education"
          subtitle="My academic foundation."
        />
        <div className="border-t border-slate-200 dark:border-white/10">
          {education.map((edu, i) => (
            <EduRow key={edu._id || i} edu={edu} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Education;
