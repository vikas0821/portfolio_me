import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, CheckCircle, AlertCircle } from "lucide-react";
import { sendContactMessage } from "../../api/portfolioService";
import SectionHeader from "./SectionHeader";

const fieldClass =
  "w-full bg-transparent border-0 border-b border-slate-300 dark:border-white/15 rounded-none px-0 py-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-accent transition-colors";

const Contact = ({ contact = {}, meta }) => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const result = await sendContactMessage(form);
      if (result) {
        setStatus("success");
        setForm({ name: "", email: "", message: "" });
      } else setStatus("error");
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const links = [
    contact.email && { label: "Email", value: contact.email, href: `mailto:${contact.email}` },
    contact.linkedin && { label: "LinkedIn", value: "in/vikas-kannaujiya0821", href: contact.linkedin },
    contact.github && { label: "GitHub", value: "github.com/vikas0821", href: contact.github },
  ].filter(Boolean);

  return (
    <section id="contact" className="scroll-mt-20 py-24 md:py-32 px-6 bg-white dark:bg-[#050505]">
      <div className="max-w-5xl mx-auto">
        <SectionHeader
          meta={meta}
          eyebrow="Contact"
          heading="Let's work together"
          subtitle="Have a role or a project in mind? I'm open to opportunities — drop a line."
        />

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left — direct channels */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                className="group inline-flex items-start gap-2 text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white hover:text-accent transition-colors"
              >
                {contact.email}
                <ArrowUpRight size={22} className="mt-1.5 text-slate-300 dark:text-slate-600 group-hover:text-accent transition-colors" />
              </a>
            )}

            <div className="mt-10 space-y-0 border-t border-slate-200 dark:border-white/10">
              {links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  target={l.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between gap-4 py-4 border-b border-slate-200 dark:border-white/10"
                >
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">{l.label}</span>
                  <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 group-hover:text-accent transition-colors">
                    {l.value}
                    <ArrowUpRight size={15} className="text-slate-300 dark:text-slate-600 group-hover:text-accent transition-colors" />
                  </span>
                </a>
              ))}
            </div>

            <p className="mt-8 text-sm text-slate-400 dark:text-slate-500">Usually replies within 24 hours.</p>
          </motion.div>

          {/* Right — minimal form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            onSubmit={handleSubmit}
            className="space-y-8"
          >
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 mb-1">Name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Your name" required className={fieldClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 mb-1">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" required className={fieldClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 mb-1">Message</label>
              <textarea name="message" value={form.message} onChange={handleChange} placeholder="Tell me about it…" rows={4} required className={`${fieldClass} resize-none`} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group inline-flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white hover:text-accent disabled:opacity-50 transition-colors"
            >
              {loading ? "Sending…" : "Send message"}
              <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>

            {status === "success" && (
              <p className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
                <CheckCircle size={15} /> Message sent — I'll get back to you soon.
              </p>
            )}
            {status === "error" && (
              <p className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400">
                <AlertCircle size={15} /> Failed to send. Please email me directly.
              </p>
            )}
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
