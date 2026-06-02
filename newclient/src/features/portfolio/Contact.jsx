import { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Send, Mail, Linkedin, Github, CheckCircle, AlertCircle, Clock, MessageSquare } from "lucide-react";
import { sendContactMessage } from "../../api/portfolioService";
import SectionHeader from "./SectionHeader";

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
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const contactLinks = [
    contact.email && { icon: Mail, label: "Email", value: contact.email, href: `mailto:${contact.email}` },
    contact.linkedin && { icon: Linkedin, label: "LinkedIn", value: "LinkedIn Profile", href: contact.linkedin },
    contact.github && { icon: Github, label: "GitHub", value: "GitHub Profile", href: contact.github },
  ].filter(Boolean);

  return (
    <section id="contact" className="scroll-mt-20 py-28 px-6 bg-white dark:bg-[#050505]">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          meta={meta}
          eyebrow="Get In Touch"
          heading="Let's Work Together"
          subtitle="Have a project in mind or just want to say hi? I'd love to hear from you."
        />

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Left — Info */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-2 space-y-5"
          >
            {/* Info card */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-white/8">
              <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-5">
                <MessageSquare size={22} className="text-accent" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">Let's connect</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                I'm always open to discussing new projects, creative ideas, or opportunities to be part of something amazing.
              </p>
            </div>

            {/* Contact links */}
            <div className="space-y-2.5">
              {contactLinks.map(({ icon: Icon, label, value, href }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="flex items-center gap-3.5 p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-white/8 hover:border-accent/35 hover:bg-accent/3 group transition-all duration-200"
                >
                  <div className="w-9 h-9 rounded-lg bg-white dark:bg-white/5 border border-slate-200/60 dark:border-white/8 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/10 group-hover:border-accent/25 transition-all">
                    <Icon size={16} className="text-slate-500 dark:text-slate-400 group-hover:text-accent transition-colors" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">{label}</p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-accent transition-colors">{value}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* Response time */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/6 border border-accent/20">
              <Clock size={16} className="text-accent flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-accent">Fast Response</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Usually within 24 hours</p>
              </div>
            </div>
          </motion.div>

          {/* Right — Form */}
          <motion.form
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onSubmit={handleSubmit}
            className="lg:col-span-3 space-y-5 p-7 rounded-2xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-white/8"
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Send a message</h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Tell me about your project or just say hello..."
                rows={5}
                required
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40 transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-accent text-white font-bold text-sm hover:bg-accent/90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-accent/25"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Send size={16} />
              )}
              {loading ? "Sending..." : "Send Message"}
            </button>

            {status === "success" && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2.5 p-4 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200/60 dark:border-green-500/20 text-green-700 dark:text-green-400 text-sm font-medium"
              >
                <CheckCircle size={16} /> Message sent! I'll get back to you soon.
              </motion.div>
            )}

            {status === "error" && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2.5 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200/60 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium"
              >
                <AlertCircle size={16} /> Failed to send. Please try again or email me directly.
              </motion.div>
            )}
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
