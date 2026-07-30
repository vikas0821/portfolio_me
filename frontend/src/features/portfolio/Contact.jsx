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
    <section id="contact" className="scroll-mt-20 py-28 px-6 bg-paper halftone-bg">
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
            {/* Info card as speech bubble */}
            <div className="speech-bubble p-6">
              <div className="w-12 h-12 rounded-xl bg-comic-yellow border-[3px] border-ink flex items-center justify-center mb-5 -rotate-3">
                <MessageSquare size={22} className="text-ink" />
              </div>
              <h3 className="font-display text-xl tracking-wide text-ink dark:text-white mb-1.5">Let's connect</h3>
              <p className="text-sm text-ink/70 dark:text-white/70 leading-relaxed font-sans">
                I'm always open to discussing new projects, creative ideas, or opportunities to be part of something amazing.
              </p>
            </div>

            {/* Contact links */}
            <div className="space-y-3">
              {contactLinks.map(({ icon: Icon, label, value, href }, i) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className={`comic-panel flex items-center gap-3.5 p-4 group ${i % 2 === 0 ? "-rotate-1" : "rotate-1"} hover:rotate-0`}
                >
                  <div className="w-9 h-9 rounded-lg bg-comic-blue/20 border-2 border-ink flex items-center justify-center flex-shrink-0 group-hover:bg-comic-blue/40 transition-all">
                    <Icon size={16} className="text-ink dark:text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-ink/50 dark:text-white/50 uppercase tracking-wide">{label}</p>
                    <p className="text-sm font-bold text-ink dark:text-white group-hover:text-accent transition-colors">{value}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* Response time */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-comic-green/20 border-2 border-ink rotate-1">
              <Clock size={16} className="text-ink dark:text-white flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-ink dark:text-white">Fast Response</p>
                <p className="text-xs text-ink/60 dark:text-white/60">Usually within 24 hours</p>
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
            className="comic-panel lg:col-span-3 space-y-5 p-7"
          >
            <h3 className="font-display text-xl tracking-wide text-ink dark:text-white">Send a message</h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-ink/60 dark:text-white/60 mb-2 uppercase tracking-wide">Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-paper border-2 border-ink dark:border-white/60 text-ink dark:text-white text-sm placeholder:text-ink/40 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-ink/60 dark:text-white/60 mb-2 uppercase tracking-wide">Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-paper border-2 border-ink dark:border-white/60 text-ink dark:text-white text-sm placeholder:text-ink/40 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink/60 dark:text-white/60 mb-2 uppercase tracking-wide">Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Tell me about your project or just say hello..."
                rows={5}
                required
                className="w-full px-4 py-3 rounded-xl bg-paper border-2 border-ink dark:border-white/60 text-ink dark:text-white text-sm placeholder:text-ink/40 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="wobble-hover w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-accent border-[3px] border-ink text-white font-display text-lg tracking-wide disabled:opacity-60 disabled:cursor-not-allowed shadow-comic-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all duration-150"
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
                className="flex items-center gap-2.5 p-4 rounded-xl bg-comic-green/20 border-2 border-ink text-ink dark:text-white text-sm font-bold"
              >
                <CheckCircle size={16} /> Message sent! I'll get back to you soon.
              </motion.div>
            )}

            {status === "error" && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2.5 p-4 rounded-xl bg-comic-red/20 border-2 border-ink text-ink dark:text-white text-sm font-bold"
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
