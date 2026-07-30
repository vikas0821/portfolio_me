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
        <div className="w-12 h-12 rounded-full bg-comic-yellow border-[3px] border-ink flex items-center justify-center shadow-comic-sm z-10">
          <Briefcase size={19} className="text-ink" />
        </div>
        {!isLast && (
          <div className="flex-1 w-[3px] border-l-[3px] border-dashed border-ink/30 dark:border-white/25 mt-3 mb-0" style={{ minHeight: "32px" }} />
        )}
      </div>

      {/* Card */}
      <div className="flex-1 pb-9">
        <div className="comic-panel group p-6">
          {/* Title row */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <div>
              <h3 className="font-display text-xl tracking-wide text-ink dark:text-white leading-tight">{exp.role}</h3>
              <p className="text-accent font-bold mt-1 text-sm">{exp.company}</p>
              {exp.location && (
                <div className="flex items-center gap-1 mt-1">
                  <MapPin size={12} className="text-ink/40 dark:text-white/40" />
                  <span className="text-xs text-ink/50 dark:text-white/50">{exp.location}</span>
                </div>
              )}
            </div>
            {exp.period && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-comic-blue/20 border-2 border-ink flex-shrink-0 -rotate-1">
                <Calendar size={12} className="text-ink dark:text-white" />
                <span className="text-xs font-bold text-ink dark:text-white whitespace-nowrap">{exp.period}</span>
              </div>
            )}
          </div>

          {/* Responsibilities */}
          {exp.responsibilities?.length > 0 && (
            <ul className="space-y-2 mb-4">
              {exp.responsibilities.map((r, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-ink/80 dark:text-white/80 leading-snug font-sans">
                  <span className="text-comic-red mt-0.5 flex-shrink-0 font-black text-base leading-none">✷</span>
                  {r}
                </li>
              ))}
            </ul>
          )}

          {/* Tech stack */}
          {exp.technologies?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-3.5 comic-dashed">
              {exp.technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 rounded-md text-xs font-bold bg-accent/10 text-accent border-2 border-accent/40"
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
    <section id="experience" className="scroll-mt-20 py-28 px-6 bg-paper halftone-bg">
      <div className="max-w-4xl mx-auto">
        <SectionHeader
          meta={meta}
          eyebrow="Career"
          heading="Work Experience"
          subtitle="Building production systems and delivering value across organizations."
        />

        {experience.length === 0 ? (
          <p className="text-center text-ink/50 dark:text-white/50 py-12">No experience added yet.</p>
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
