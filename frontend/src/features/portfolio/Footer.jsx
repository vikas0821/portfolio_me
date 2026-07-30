import { Github, Linkedin, Mail, ArrowUp } from "lucide-react";
import { Link } from "react-router-dom";

const NAV_QUICK = [
  { label: "Skills", id: "skills" },
  { label: "Projects", id: "projects" },
  { label: "Experience", id: "experience" },
  { label: "Certifications", id: "certifications" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", id: "contact" },
];

const Footer = ({ contact = {}, settings = {} }) => {
  const year = new Date().getFullYear();
  const footer = settings.footer || {};

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="bg-slate-900 dark:bg-black border-t border-white/8">
      <div className="max-w-7xl mx-auto px-6 pt-14 pb-8">
        <div className="grid md:grid-cols-3 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-black text-sm">V</div>
              <span className="text-white font-bold text-lg">Kannaujiya</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              {footer.tagline || "Backend engineer crafting scalable, secure systems. Open to new opportunities."}
            </p>
            <div className="flex items-center gap-2 mt-5">
              {contact.github && (
                <a href={contact.github} target="_blank" rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-accent hover:border-accent/30 transition-all duration-200">
                  <Github size={17} />
                </a>
              )}
              {contact.linkedin && (
                <a href={contact.linkedin} target="_blank" rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-accent hover:border-accent/30 transition-all duration-200">
                  <Linkedin size={17} />
                </a>
              )}
              {contact.email && (
                <a href={`mailto:${contact.email}`}
                  className="p-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-accent hover:border-accent/30 transition-all duration-200">
                  <Mail size={17} />
                </a>
              )}
            </div>
          </div>

          {/* Quick Nav */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-5">Quick Links</h4>
            <nav className="space-y-2.5">
              {NAV_QUICK.map(({ label, id, to }) =>
                to ? (
                  <Link
                    key={label}
                    to={to}
                    className="block text-sm text-slate-400 hover:text-accent transition-colors duration-200"
                  >
                    {label}
                  </Link>
                ) : (
                  <button
                    key={label}
                    onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })}
                    className="block text-sm text-slate-400 hover:text-accent transition-colors duration-200"
                  >
                    {label}
                  </button>
                )
              )}
            </nav>
          </div>

          {/* CTA */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-5">Get In Touch</h4>
            <p className="text-sm text-slate-400 mb-5 leading-relaxed">
              {footer.ctaText || "Looking for a developer? Let's build something great together."}
            </p>
            <button
              onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-bold hover:bg-accent/90 active:scale-95 transition-all duration-200"
            >
              <Mail size={15} /> Hire Me
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            {footer.copyright || `© ${year} Vikas Kannaujiya. Built with React, Node.js & MongoDB.`}
          </p>
          <button
            onClick={scrollTop}
            aria-label="Back to top"
            className="p-2.5 rounded-xl border border-white/10 text-slate-500 hover:text-accent hover:border-accent/30 transition-all duration-200"
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
