import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import SectionHeader from "./SectionHeader";

const SkillRow = ({ skill, index }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
      className="grid md:grid-cols-12 gap-x-8 gap-y-3 py-8 border-b border-slate-200 dark:border-white/10"
    >
      <h3 className="md:col-span-4 text-lg font-semibold text-slate-900 dark:text-white">
        {skill.category}
      </h3>
      <div className="md:col-span-8 flex flex-wrap gap-x-6 gap-y-2.5">
        {(skill.items || []).map((item) => (
          <span key={item} className="text-[15px] text-slate-600 dark:text-slate-300">
            {item}
          </span>
        ))}
      </div>
    </motion.div>
  );
};

const Skills = ({ skills = [], meta }) => {
  return (
    <section id="skills" className="scroll-mt-20 py-24 md:py-32 px-6 bg-slate-50/80 dark:bg-zinc-950">
      <div className="max-w-5xl mx-auto">
        <SectionHeader
          meta={meta}
          eyebrow="Capabilities"
          heading="Skills & Expertise"
          subtitle="The stack I reach for to build scalable, secure, production-ready systems."
          count={skills.length ? `${String(skills.length).padStart(2, "0")} areas` : null}
        />

        <div className="border-t border-slate-200 dark:border-white/10">
          {skills.map((skill, i) => (
            <SkillRow key={skill.category || i} skill={skill} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
