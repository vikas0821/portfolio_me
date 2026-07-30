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
    <footer className="relative bg-[#141118] border-t-[5px] border-ink halftone-bg">
      <div className="max-w-7xl mx-auto px-6 pt-14 pb-8">
        <div className="grid md:grid-cols-3 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 -rotate-6 rounded-xl bg-comic-yellow border-[3px] border-white/85 flex items-center justify-center text-ink font-display text-base">V</div>
              <span className="font-display text-xl tracking-wide text-white">KANNAUJIYA</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs font-sans">
              {footer.tagline || "Backend engineer crafting scalable, secure systems. Open to new opportunities."}
            </p>
            <div className="flex items-center gap-2.5 mt-5">
              {contact.github && (
                <a href={contact.github} target="_blank" rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border-2 border-white/30 text-white/70 hover:text-ink hover:bg-comic-yellow hover:border-white/85 hover:-rotate-6 transition-all duration-200">
                  <Github size={17} />
                </a>
              )}
              {contact.linkedin && (
                <a href={contact.linkedin} target="_blank" rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border-2 border-white/30 text-white/70 hover:text-white hover:bg-comic-blue hover:border-white/85 hover:rotate-6 transition-all duration-200">
                  <Linkedin size={17} />
                </a>
              )}
              {contact.email && (
                <a href={`mailto:${contact.email}`}
                  className="p-2.5 rounded-xl border-2 border-white/30 text-white/70 hover:text-white hover:bg-comic-pink hover:border-white/85 hover:-rotate-6 transition-all duration-200">
                  <Mail size={17} />
                </a>
              )}
            </div>
          </div>

          {/* Quick Nav */}
          <div>
            <h4 className="font-display text-sm tracking-widest text-comic-yellow mb-5">QUICK LINKS</h4>
            <nav className="space-y-2.5">
              {NAV_QUICK.map(({ label, id, to }) =>
                to ? (
                  <Link
                    key={label}
                    to={to}
                    className="block text-sm font-bold text-white/60 hover:text-comic-yellow transition-colors duration-200"
                  >
                    {label}
                  </Link>
                ) : (
                  <button
                    key={label}
                    onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })}
                    className="block text-sm font-bold text-white/60 hover:text-comic-yellow transition-colors duration-200"
                  >
                    {label}
                  </button>
                )
              )}
            </nav>
          </div>

          {/* CTA */}
          <div>
            <h4 className="font-display text-sm tracking-widest text-comic-yellow mb-5">GET IN TOUCH</h4>
            <p className="text-sm text-white/60 mb-5 leading-relaxed font-sans">
              {footer.ctaText || "Looking for a developer? Let's build something great together."}
            </p>
            <button
              onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
              className="wobble-hover inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent border-[3px] border-white/85 text-white text-sm font-display tracking-wide active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150"
            >
              <Mail size={15} /> Hire Me
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t-2 border-dashed border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40 font-sans">
            {footer.copyright || `© ${year} Vikas Kannaujiya. Built with React, Node.js & MongoDB.`}
          </p>
          <button
            onClick={scrollTop}
            aria-label="Back to top"
            className="p-2.5 rounded-xl border-2 border-white/30 text-white/60 hover:text-ink hover:bg-comic-yellow hover:border-white/85 transition-all duration-200"
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
