import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Github, ExternalLink, Star, Layers } from "lucide-react";
import SectionHeader from "./SectionHeader";

const ProjectCard = ({ project, index }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.08 });
  const isFeatured = project.isFeatured;
  const rotate = index % 2 === 0 ? "-rotate-1" : "rotate-1";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
      className={`comic-panel group relative overflow-visible ${rotate} hover:rotate-0`}
    >
      {isFeatured && (
        <span className="comic-burst absolute -top-5 -right-5 w-20 h-20 bg-comic-red border-[3px] border-ink flex items-center justify-center z-10 rotate-6">
          <span className="flex flex-col items-center leading-none">
            <Star size={13} className="text-white mb-0.5" fill="currentColor" />
            <span className="text-white text-[10px] font-display tracking-wide">TOP</span>
          </span>
        </span>
      )}

      <div className="relative p-7">
        {/* Header row */}
        <div className="flex items-start gap-3 mb-4">
          <span className="font-display text-3xl text-accent/70 flex-shrink-0 select-none leading-none">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="w-10 h-10 rounded-xl bg-comic-yellow border-[3px] border-ink flex items-center justify-center flex-shrink-0 group-hover:-rotate-12 transition-transform duration-300">
            <Layers size={18} className="text-ink" />
          </div>
          <h3 className={`font-display text-2xl tracking-wide text-ink dark:text-white leading-tight min-w-0 pt-1 ${isFeatured ? "pr-14" : ""}`}>
            {project.title}
          </h3>
        </div>

        <p className="text-sm text-ink/70 dark:text-white/70 leading-relaxed mb-5 font-sans">
          {project.description}
        </p>

        {/* Metrics */}
        {project.metrics && Object.values(project.metrics).some(Boolean) && (
          <div className="flex flex-wrap gap-3 mb-5">
            {project.metrics.uptime && (
              <div className="px-3 py-2 rounded-lg bg-comic-green/25 border-2 border-ink">
                <p className="font-display text-lg text-ink dark:text-white leading-none">{project.metrics.uptime}</p>
                <p className="text-[10px] text-ink/60 dark:text-white/60 font-bold uppercase">Uptime</p>
              </div>
            )}
            {project.metrics.latency && (
              <div className="px-3 py-2 rounded-lg bg-comic-blue/25 border-2 border-ink">
                <p className="font-display text-lg text-ink dark:text-white leading-none">{project.metrics.latency}</p>
                <p className="text-[10px] text-ink/60 dark:text-white/60 font-bold uppercase">Latency</p>
              </div>
            )}
            {project.metrics.scale && (
              <div className="px-3 py-2 rounded-lg bg-comic-pink/25 border-2 border-ink">
                <p className="font-display text-lg text-ink dark:text-white leading-none">{project.metrics.scale}</p>
                <p className="text-[10px] text-ink/60 dark:text-white/60 font-bold uppercase">Scale</p>
              </div>
            )}
          </div>
        )}

        {/* Key points */}
        {project.points?.length > 0 && (
          <ul className="space-y-2 mb-5">
            {project.points.slice(0, 4).map((point, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-ink/80 dark:text-white/80 leading-snug font-sans">
                <span className="text-comic-red mt-0.5 flex-shrink-0 font-black">✷</span>
                {point}
              </li>
            ))}
          </ul>
        )}

        {/* Tech stack */}
        {project.tech?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {project.tech.map((tech) => (
              <span
                key={tech}
                className="px-2.5 py-1 rounded-md text-xs font-bold bg-paper text-ink border-2 border-ink dark:border-white/50 dark:text-white/80"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* Links */}
        <div className="flex items-center gap-4 pt-4 comic-dashed">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-ink/70 dark:text-white/70 hover:text-accent transition-colors duration-200"
            >
              <Github size={15} /> Source Code
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-ink/70 dark:text-white/70 hover:text-accent transition-colors duration-200"
            >
              <ExternalLink size={15} /> Live Demo
            </a>
          )}
          {!project.githubUrl && !project.liveUrl && (
            <span className="text-xs text-ink/40 dark:text-white/40 italic">Private project</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const Projects = ({ projects = [], meta }) => {
  const featured = projects.filter((p) => p.isFeatured);
  const rest = projects.filter((p) => !p.isFeatured);
  const ordered = [...featured, ...rest];

  return (
    <section id="projects" className="scroll-mt-20 py-28 px-6 bg-paper">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          meta={meta}
          eyebrow="My Work"
          heading="Selected Projects"
          subtitle="Production-grade projects that showcase my engineering capabilities."
        />

        <div className="grid md:grid-cols-2 gap-x-8 gap-y-12">
          {ordered.map((project, i) => (
            <ProjectCard key={project._id || i} project={project} index={i} />
          ))}
        </div>

        {ordered.length === 0 && (
          <p className="text-center text-ink/50 dark:text-white/50 py-12">No projects added yet.</p>
        )}
      </div>
    </section>
  );
};

export default Projects;
