import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import SectionHeader from "./SectionHeader";

const CATEGORY_META = {
  Frontend:        { emoji: "⚡", color: "from-blue-500/20 to-cyan-500/10", dot: "bg-blue-400" },
  Backend:         { emoji: "🔧", color: "from-green-500/20 to-emerald-500/10", dot: "bg-green-400" },
  Database:        { emoji: "🗄️", color: "from-purple-500/20 to-violet-500/10", dot: "bg-purple-400" },
  "DevOps & Tools":{ emoji: "🐳", color: "from-orange-500/20 to-red-500/10", dot: "bg-orange-400" },
};

const TAG_COLORS = [
  "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200/60 dark:border-blue-500/20",
  "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-300 border-green-200/60 dark:border-green-500/20",
  "bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200/60 dark:border-purple-500/20",
  "bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-200/60 dark:border-orange-500/20",
];

const SkillCard = ({ skill, index }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const meta = CATEGORY_META[skill.category] || { emoji: "🛠️", color: "from-slate-500/10 to-transparent", dot: "bg-slate-400" };
  const tagColor = TAG_COLORS[index % TAG_COLORS.length];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
      className="group relative p-6 rounded-2xl bg-white dark:bg-zinc-900/80 border border-slate-200/80 dark:border-white/8 hover:border-accent/35 hover:shadow-xl hover:shadow-accent/5 transition-all duration-300 overflow-hidden"
    >
      {/* Card gradient bg */}
      <div className={`absolute inset-0 bg-gradient-to-br ${meta.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-xl border border-slate-200/60 dark:border-white/8 group-hover:scale-110 transition-transform duration-300`}>
            {meta.emoji}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{skill.category}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
              <span className="text-xs text-slate-400 dark:text-slate-500">{(skill.items || []).length} technologies</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {(skill.items || []).map((item) => (
            <span
              key={item}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 group-hover:border-accent/30 group-hover:text-accent group-hover:bg-accent/8 ${tagColor}`}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const Skills = ({ skills = [], meta }) => {
  return (
    <section id="skills" className="scroll-mt-20 py-28 px-6 bg-slate-50/80 dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          meta={meta}
          eyebrow="What I work with"
          heading="Skills & Expertise"
          subtitle="Technologies and tools I use to build scalable, production-ready applications."
        />

        {/* Cards grid */}
        <div className="grid md:grid-cols-2 gap-5">
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
            className="text-center mt-12 text-sm text-slate-400 dark:text-slate-600"
          >
            Always learning &amp; adapting to new technologies
          </motion.p>
        )}
      </div>
    </section>
  );
};

export default Skills;
