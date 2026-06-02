import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { GraduationCap, MapPin } from "lucide-react";
import SectionHeader from "./SectionHeader";

const EduCard = ({ edu, index, isLast }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -24 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.12, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative flex gap-6"
    >
      {/* Timeline */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="w-11 h-11 rounded-xl bg-accent/12 border border-accent/25 flex items-center justify-center shadow-md shadow-accent/10 z-10">
          <GraduationCap size={18} className="text-accent" />
        </div>
        {!isLast && (
          <div className="flex-1 w-px bg-gradient-to-b from-accent/30 to-slate-200 dark:to-white/5 mt-3" style={{ minHeight: "24px" }} />
        )}
      </div>

      {/* Card */}
      <div className="flex-1 pb-7">
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/80 border border-slate-200/80 dark:border-white/8 hover:border-accent/30 hover:shadow-lg transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{edu.qualification}</h3>
              <p className="text-accent font-semibold text-sm mt-1">{edu.institution}</p>
              {edu.location && (
                <div className="flex items-center gap-1 mt-1.5">
                  <MapPin size={12} className="text-slate-400" />
                  <span className="text-xs text-slate-400 dark:text-slate-500">{edu.location}</span>
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              {edu.year && (
                <span className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/8 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {edu.year}
                </span>
              )}
              {edu.score && (
                <span className="text-xs font-semibold text-accent bg-accent/10 border border-accent/20 px-2.5 py-1 rounded-lg">
                  {edu.score}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Education = ({ education = [], meta }) => {
  if (education.length === 0) return null;

  return (
    <section id="education" className="scroll-mt-20 py-28 px-6 bg-white dark:bg-[#050505]">
      <div className="max-w-4xl mx-auto">
        <SectionHeader
          meta={meta}
          eyebrow="Academic"
          heading="Education"
          subtitle="My academic foundation and qualifications."
        />

        <div>
          {education.map((edu, i) => (
            <EduCard key={edu._id || i} edu={edu} index={i} isLast={i === education.length - 1} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Education;
