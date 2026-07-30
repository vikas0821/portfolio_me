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
        <div className="w-12 h-12 rounded-full bg-comic-pink border-[3px] border-ink flex items-center justify-center shadow-comic-sm z-10">
          <GraduationCap size={19} className="text-ink" />
        </div>
        {!isLast && (
          <div className="flex-1 w-[3px] border-l-[3px] border-dashed border-ink/30 dark:border-white/25 mt-3" style={{ minHeight: "24px" }} />
        )}
      </div>

      {/* Card */}
      <div className="flex-1 pb-8">
        <div className="comic-panel p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <h3 className="font-display text-lg tracking-wide text-ink dark:text-white">{edu.qualification}</h3>
              <p className="text-accent font-bold text-sm mt-1">{edu.institution}</p>
              {edu.location && (
                <div className="flex items-center gap-1 mt-1.5">
                  <MapPin size={12} className="text-ink/40 dark:text-white/40" />
                  <span className="text-xs text-ink/50 dark:text-white/50">{edu.location}</span>
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              {edu.year && (
                <span className="px-3 py-1.5 rounded-lg bg-comic-yellow border-2 border-ink text-xs font-bold text-ink rotate-1">
                  {edu.year}
                </span>
              )}
              {edu.score && (
                <span className="text-xs font-bold text-accent bg-accent/10 border-2 border-accent/40 px-2.5 py-1 rounded-lg">
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
    <section id="education" className="scroll-mt-20 py-28 px-6 bg-paper">
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
