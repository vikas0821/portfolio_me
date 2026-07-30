import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Award, ExternalLink, CheckCircle } from "lucide-react";
import SectionHeader from "./SectionHeader";

const BADGE_COLORS = ["bg-comic-yellow", "bg-comic-blue", "bg-comic-pink", "bg-comic-green"];

const CertCard = ({ cert, index }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const rotate = index % 2 === 0 ? "-rotate-1" : "rotate-1";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
      className={`comic-panel group relative p-5 flex flex-col ${rotate} hover:rotate-0`}
    >
      <div className="flex items-start gap-4 flex-1">
        {/* Icon / Logo */}
        {cert.logo ? (
          <img
            src={cert.logo}
            alt={cert.platform}
            className="w-12 h-12 object-contain rounded-xl flex-shrink-0 border-2 border-ink p-1.5 bg-white"
          />
        ) : (
          <div className={`w-12 h-12 rounded-xl ${BADGE_COLORS[index % BADGE_COLORS.length]} border-[3px] border-ink flex items-center justify-center flex-shrink-0 group-hover:-rotate-12 transition-transform duration-300`}>
            <Award size={22} className="text-ink" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-ink dark:text-white leading-snug group-hover:text-accent transition-colors duration-200">
            {cert.title}
          </h3>
          <p className="text-xs font-bold text-accent mt-1.5">{cert.platform}</p>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            {cert.issuer && (
              <span className="text-xs text-ink/50 dark:text-white/50">{cert.issuer}</span>
            )}
            {cert.year && (
              <>
                <span className="w-0.5 h-0.5 rounded-full bg-ink/40 dark:bg-white/40" />
                <span className="text-xs text-ink/50 dark:text-white/50">{cert.year}</span>
              </>
            )}
          </div>
          {cert.credentialId && (
            <p className="text-xs text-ink/50 dark:text-white/50 font-mono mt-1.5 truncate">
              ID: {cert.credentialId}
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      {cert.certificateUrl && (
        <div className="mt-4 pt-3.5 comic-dashed">
          <a
            href={cert.certificateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-ink/70 dark:text-white/70 hover:text-accent transition-colors duration-200"
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
    <section id="certifications" className="scroll-mt-20 py-28 px-6 bg-paper halftone-bg">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          meta={meta}
          eyebrow="Learning"
          heading="Certifications"
          subtitle="Continuous learning through structured courses and industry certifications."
        />

        {certifications.length === 0 ? (
          <p className="text-center text-ink/50 dark:text-white/50 py-12">No certifications added yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
