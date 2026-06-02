import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Github, ExternalLink, Star, Layers } from "lucide-react";
import SectionHeader from "./SectionHeader";

const ProjectCard = ({ project, index }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.08 });
  const isFeatured = project.isFeatured;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
      className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 ${
        isFeatured
          ? "border-accent/30 dark:border-accent/20 hover:border-accent/60 hover:shadow-2xl hover:shadow-accent/10 bg-gradient-to-br from-white to-indigo-50/40 dark:from-zinc-900 dark:to-zinc-900/80"
          : "border-slate-200/80 dark:border-white/8 hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5 bg-white dark:bg-zinc-900/80"
      }`}
    >
      {/* Top accent stripe for featured */}
      {isFeatured && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent" />
      )}

      <div className="relative p-7">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-sm font-black tabular-nums text-accent/60 flex-shrink-0 pt-0.5 select-none">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
              <Layers size={18} className="text-accent" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-accent transition-colors duration-200 leading-tight min-w-0">
              {project.title}
            </h3>
          </div>

          {isFeatured && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/12 text-accent text-xs font-semibold border border-accent/25 flex-shrink-0">
              <Star size={11} fill="currentColor" /> Featured
            </span>
          )}
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-5">
          {project.description}
        </p>

        {/* Metrics */}
        {project.metrics && Object.values(project.metrics).some(Boolean) && (
          <div className="flex flex-wrap gap-5 mb-5 p-4 rounded-xl bg-slate-50 dark:bg-white/3 border border-slate-100 dark:border-white/5">
            {project.metrics.uptime && (
              <div>
                <p className="text-lg font-black text-accent">{project.metrics.uptime}</p>
                <p className="text-xs text-slate-400 font-medium">Uptime</p>
              </div>
            )}
            {project.metrics.latency && (
              <div>
                <p className="text-lg font-black text-accent">{project.metrics.latency}</p>
                <p className="text-xs text-slate-400 font-medium">Latency</p>
              </div>
            )}
            {project.metrics.scale && (
              <div>
                <p className="text-lg font-black text-accent">{project.metrics.scale}</p>
                <p className="text-xs text-slate-400 font-medium">Scale</p>
              </div>
            )}
          </div>
        )}

        {/* Key points */}
        {project.points?.length > 0 && (
          <ul className="space-y-2 mb-5">
            {project.points.slice(0, 4).map((point, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-slate-600 dark:text-slate-300 leading-snug">
                <span className="text-accent mt-0.5 flex-shrink-0 font-bold">›</span>
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
                className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-white/6"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* Links */}
        <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-white/5">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-accent transition-colors duration-200"
            >
              <Github size={15} /> Source Code
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-accent transition-colors duration-200"
            >
              <ExternalLink size={15} /> Live Demo
            </a>
          )}
          {!project.githubUrl && !project.liveUrl && (
            <span className="text-xs text-slate-400 italic">Private project</span>
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
    <section id="projects" className="scroll-mt-20 py-28 px-6 bg-white dark:bg-[#050505]">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          meta={meta}
          eyebrow="My Work"
          heading="Selected Projects"
          subtitle="Production-grade projects that showcase my engineering capabilities."
        />

        <div className="grid md:grid-cols-2 gap-6">
          {ordered.map((project, i) => (
            <ProjectCard key={project._id || i} project={project} index={i} />
          ))}
        </div>

        {ordered.length === 0 && (
          <p className="text-center text-slate-400 dark:text-slate-500 py-12">No projects added yet.</p>
        )}
      </div>
    </section>
  );
};

export default Projects;
