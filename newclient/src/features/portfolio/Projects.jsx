import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Github, ExternalLink } from "lucide-react";
import SectionHeader from "./SectionHeader";

const METRIC_KEYS = ["uptime", "latency", "scale"];

const ProjectRow = ({ project, index }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.08 });
  const hasMetrics = project.metrics && Object.values(project.metrics).some(Boolean);

  return (
    <motion.li
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.25, 0.1, 0.25, 1] }}
      className="group py-10 md:py-12"
    >
      <div className="grid md:grid-cols-12 gap-x-8 gap-y-5">
        {/* Index */}
        <div className="md:col-span-1">
          <span className="text-sm font-medium tabular-nums text-slate-400 dark:text-slate-600">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        {/* Title + body */}
        <div className="md:col-span-7">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h3 className="text-2xl md:text-[2rem] leading-tight font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-accent transition-colors duration-300">
              {project.title}
            </h3>
            {project.isFeatured && (
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-accent border border-accent/40 rounded-full px-2.5 py-0.5">
                Featured
              </span>
            )}
          </div>

          <p className="mt-4 text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
            {project.description}
          </p>

          {project.points?.length > 0 && (
            <ul className="mt-4 space-y-2">
              {project.points.slice(0, 3).map((pt, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-600 dark:text-slate-300 leading-snug">
                  <span className="text-accent select-none">—</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          )}

          {(project.githubUrl || project.liveUrl) && (
            <div className="mt-6 flex items-center gap-6">
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-accent transition-colors">
                  <Github size={15} /> Source
                </a>
              )}
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-accent transition-colors">
                  <ExternalLink size={15} /> Live
                </a>
              )}
            </div>
          )}
        </div>

        {/* Metrics + tech (right rail) */}
        <div className="md:col-span-4 md:text-right">
          {hasMetrics && (
            <div className="flex md:justify-end gap-8 mb-6">
              {METRIC_KEYS.map((k) => project.metrics[k] && (
                <div key={k}>
                  <p className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">{project.metrics[k]}</p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-[0.15em] text-slate-400 dark:text-slate-600">{k}</p>
                </div>
              ))}
            </div>
          )}
          {project.tech?.length > 0 && (
            <p className="text-sm text-slate-400 dark:text-slate-500 leading-relaxed">
              {project.tech.join("  ·  ")}
            </p>
          )}
        </div>
      </div>
    </motion.li>
  );
};

const Projects = ({ projects = [], meta }) => {
  const featured = projects.filter((p) => p.isFeatured);
  const rest = projects.filter((p) => !p.isFeatured);
  const ordered = [...featured, ...rest];

  return (
    <section id="projects" className="scroll-mt-20 py-24 md:py-32 px-6 bg-white dark:bg-[#050505]">
      <div className="max-w-5xl mx-auto">
        <SectionHeader
          meta={meta}
          eyebrow="Selected Work"
          heading="Projects"
          subtitle="Production systems built for fintech and banking — at scale, under load, in compliance."
          count={ordered.length ? `${String(ordered.length).padStart(2, "0")} projects` : null}
        />

        {ordered.length === 0 ? (
          <p className="text-slate-400 dark:text-slate-500 py-12">No projects added yet.</p>
        ) : (
          <ul className="divide-y divide-slate-200 dark:divide-white/10 border-t border-b border-slate-200 dark:border-white/10">
            {ordered.map((project, i) => (
              <ProjectRow key={project._id || i} project={project} index={i} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default Projects;
