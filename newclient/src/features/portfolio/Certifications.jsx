import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Award, ExternalLink, CheckCircle } from "lucide-react";
import SectionHeader from "./SectionHeader";

const CertCard = ({ cert, index }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
      className="group relative p-5 rounded-2xl bg-white dark:bg-zinc-900/80 border border-slate-200/80 dark:border-white/8 hover:border-accent/35 hover:shadow-xl hover:shadow-accent/5 transition-all duration-300 flex flex-col"
    >
      {/* Top strip on hover */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-400 rounded-t-2xl" />

      <div className="flex items-start gap-4 flex-1">
        {/* Icon / Logo */}
        {cert.logo ? (
          <img
            src={cert.logo}
            alt={cert.platform}
            className="w-12 h-12 object-contain rounded-xl flex-shrink-0 border border-slate-100 dark:border-white/8 p-1.5 bg-white dark:bg-zinc-800"
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-violet-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-accent/25 group-hover:scale-110 transition-transform duration-300">
            <Award size={22} className="text-white" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug group-hover:text-accent transition-colors duration-200">
            {cert.title}
          </h3>
          <p className="text-xs font-semibold text-accent mt-1.5">{cert.platform}</p>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            {cert.issuer && (
              <span className="text-xs text-slate-400 dark:text-slate-500">{cert.issuer}</span>
            )}
            {cert.year && (
              <>
                <span className="w-0.5 h-0.5 rounded-full bg-slate-400" />
                <span className="text-xs text-slate-400 dark:text-slate-500">{cert.year}</span>
              </>
            )}
          </div>
          {cert.credentialId && (
            <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-1.5 truncate">
              ID: {cert.credentialId}
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      {cert.certificateUrl && (
        <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-white/5">
          <a
            href={cert.certificateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-accent transition-colors duration-200"
          >
            <CheckCircle size={13} /> View Certificate
            <ExternalLink size={11} />
          </a>
        </div>
      )}
    </motion.div>
  );
};

const Certifications = ({ certifications = [], meta }) => {
  return (
    <section id="certifications" className="scroll-mt-20 py-28 px-6 bg-slate-50/80 dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          meta={meta}
          eyebrow="Learning"
          heading="Certifications"
          subtitle="Continuous learning through structured courses and industry certifications."
        />

        {certifications.length === 0 ? (
          <p className="text-center text-slate-400 dark:text-slate-500 py-12">No certifications added yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {certifications.map((cert, i) => (
              <CertCard key={cert._id || i} cert={cert} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Certifications;
