import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import SectionHeader from "./SectionHeader";

const CATEGORY_META = {
  Frontend:        { emoji: "⚡", strip: "bg-comic-blue" },
  Backend:         { emoji: "🔧", strip: "bg-comic-green" },
  Database:        { emoji: "🗄️", strip: "bg-comic-pink" },
  "DevOps & Tools":{ emoji: "🐳", strip: "bg-comic-yellow" },
};

const TAG_COLORS = ["bg-comic-yellow", "bg-comic-blue", "bg-comic-pink", "bg-comic-green"];

const SkillCard = ({ skill, index }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const meta = CATEGORY_META[skill.category] || { emoji: "🛠️", strip: "bg-comic-yellow" };
  const rotate = index % 2 === 0 ? "-rotate-1" : "rotate-1";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
      className={`comic-panel group relative p-6 overflow-hidden ${rotate} hover:rotate-0`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-12 h-12 rounded-xl ${meta.strip} border-[3px] border-ink flex items-center justify-center text-xl group-hover:-rotate-12 transition-transform duration-300`}>
          {meta.emoji}
        </div>
        <div>
          <h3 className="font-display text-xl tracking-wide text-ink dark:text-white">{skill.category}</h3>
          <p className="text-xs text-ink/50 dark:text-white/50 font-bold">{(skill.items || []).length} technologies</p>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {(skill.items || []).map((item, i) => (
          <span
            key={item}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 border-ink text-ink ${TAG_COLORS[(index + i) % TAG_COLORS.length]}`}
          >
            {item}
          </span>
        ))}
      </div>
    </motion.div>
  );
};

const Skills = ({ skills = [], meta }) => {
  return (
    <section id="skills" className="scroll-mt-20 py-28 px-6 bg-paper halftone-bg">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          meta={meta}
          eyebrow="What I work with"
          heading="Skills & Expertise"
          subtitle="Technologies and tools I use to build scalable, production-ready applications."
        />

        {/* Cards grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {skills.map((skill, i) => (
            <SkillCard key={skill.category || i} skill={skill} index={i} />
          ))}
        </div>

        {/* Bottom tagline */}
        {skills.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-14 font-display text-lg tracking-wide text-ink/60 dark:text-white/60"
          >
            ALWAYS LEARNING &amp; ADAPTING TO NEW TECH
          </motion.p>
        )}
      </div>
    </section>
  );
};

export default Skills;
