import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Briefcase, Calendar, MapPin } from "lucide-react";
import SectionHeader from "./SectionHeader";

const ExperienceCard = ({ exp, index, isLast }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -24 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.12, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative flex gap-6"
    >
      {/* Timeline column */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent to-violet-500 flex items-center justify-center shadow-lg shadow-accent/25 z-10">
          <Briefcase size={18} className="text-white" />
        </div>
        {!isLast && (
          <div className="flex-1 w-px bg-gradient-to-b from-accent/30 to-slate-200 dark:to-white/5 mt-3 mb-0" style={{ minHeight: "32px" }} />
        )}
      </div>

      {/* Card */}
      <div className="flex-1 pb-8">
        <div className="group p-6 rounded-2xl bg-white dark:bg-zinc-900/80 border border-slate-200/80 dark:border-white/8 hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5 transition-all duration-300">
          {/* Title row */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{exp.role}</h3>
              <p className="text-accent font-semibold mt-1 text-sm">{exp.company}</p>
              {exp.location && (
                <div className="flex items-center gap-1 mt-1">
                  <MapPin size={12} className="text-slate-400" />
                  <span className="text-xs text-slate-400 dark:text-slate-500">{exp.location}</span>
                </div>
              )}
            </div>
            {exp.period && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/8 flex-shrink-0">
                <Calendar size={12} className="text-slate-400" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">{exp.period}</span>
              </div>
            )}
          </div>

          {/* Responsibilities */}
          {exp.responsibilities?.length > 0 && (
            <ul className="space-y-2 mb-4">
              {exp.responsibilities.map((r, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-slate-600 dark:text-slate-300 leading-snug">
                  <span className="text-accent mt-0.5 flex-shrink-0 font-bold text-base leading-none">›</span>
                  {r}
                </li>
              ))}
            </ul>
          )}

          {/* Tech stack */}
          {exp.technologies?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-3.5 border-t border-slate-100 dark:border-white/5">
              {exp.technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 rounded-md text-xs font-semibold bg-accent/8 text-accent border border-accent/20"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const Experience = ({ experience = [], meta }) => {
  return (
    <section id="experience" className="scroll-mt-20 py-28 px-6 bg-slate-50/80 dark:bg-zinc-950">
      <div className="max-w-4xl mx-auto">
        <SectionHeader
          meta={meta}
          eyebrow="Career"
          heading="Work Experience"
          subtitle="Building production systems and delivering value across organizations."
        />

        {experience.length === 0 ? (
          <p className="text-center text-slate-400 dark:text-slate-500 py-12">No experience added yet.</p>
        ) : (
          <div>
            {experience.map((exp, i) => (
              <ExperienceCard
                key={exp._id || i}
                exp={exp}
                index={i}
                isLast={i === experience.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Experience;
