import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ArrowUpRight } from "lucide-react";
import SectionHeader from "./SectionHeader";

const CertRow = ({ cert, index }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const meta = [cert.platform || cert.issuer, cert.year].filter(Boolean).join("  ·  ");
  const Wrapper = cert.certificateUrl ? "a" : "div";
  const linkProps = cert.certificateUrl
    ? { href: cert.certificateUrl, target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Wrapper
        {...linkProps}
        className="group grid md:grid-cols-12 gap-x-8 gap-y-1 items-baseline py-7 border-b border-slate-200 dark:border-white/10"
      >
        <div className="md:col-span-9">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-accent transition-colors">
            {cert.title}
          </h3>
          {meta && <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">{meta}</p>}
          {cert.credentialId && (
            <p className="mt-1 text-xs font-mono text-slate-400 dark:text-slate-600">ID: {cert.credentialId}</p>
          )}
        </div>
        {cert.certificateUrl && (
          <div className="md:col-span-3 md:text-right">
            <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-400 dark:text-slate-500 group-hover:text-accent transition-colors">
              View <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          </div>
        )}
      </Wrapper>
    </motion.div>
  );
};

const Certifications = ({ certifications = [], meta }) => {
  return (
    <section id="certifications" className="scroll-mt-20 py-24 md:py-32 px-6 bg-slate-50/80 dark:bg-zinc-950">
      <div className="max-w-5xl mx-auto">
        <SectionHeader
          meta={meta}
          eyebrow="Credentials"
          heading="Certifications"
          subtitle="Continuous learning through structured courses and certifications."
          count={certifications.length ? `${String(certifications.length).padStart(2, "0")}` : null}
        />

        {certifications.length === 0 ? (
          <p className="text-slate-400 dark:text-slate-500 py-12">No certifications added yet.</p>
        ) : (
          <div className="border-t border-slate-200 dark:border-white/10">
            {certifications.map((cert, i) => (
              <CertRow key={cert._id || i} cert={cert} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Certifications;
