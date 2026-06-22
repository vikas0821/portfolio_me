import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

const NAV_ITEMS = [
  { label: "About", id: "hero" },
  { label: "Skills", id: "skills" },
  { label: "Projects", id: "projects" },
  { label: "Experience", id: "experience" },
  { label: "Certifications", id: "certifications" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", id: "contact" },
];

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeId, setActiveId] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const onHome = location.pathname === "/portfolio";

  // Section links: scroll if on the portfolio page, otherwise navigate there then scroll.
  const goSection = (id) => {
    if (onHome) scrollToId(id);
    else navigate("/portfolio", { state: { scrollTo: id } });
  };

  const handleItem = (item) => {
    setMobileOpen(false);
    if (item.to) navigate(item.to);
    else goSection(item.id);
  };

  const isActive = (item) =>
    item.to ? location.pathname.startsWith(item.to) : onHome && activeId === item.id;

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
      setScrolled(scrollTop > 40);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!onHome) { setActiveId(""); return; }
    let observer;
    let retry;
    const attach = () => {
      const els = NAV_ITEMS.filter((i) => i.id)
        .map((i) => document.getElementById(i.id))
        .filter(Boolean);
      if (els.length === 0) { retry = setTimeout(attach, 200); return; } // wait for sections to render
      observer = new IntersectionObserver(
        (entries) => entries.forEach((e) => { if (e.isIntersecting) setActiveId(e.target.id); }),
        { threshold: 0.3 }
      );
      els.forEach((el) => observer.observe(el));
    };
    attach();
    return () => { if (observer) observer.disconnect(); if (retry) clearTimeout(retry); };
  }, [onHome]);

  const goHire = () => { setMobileOpen(false); goSection("contact"); };
  const goLogo = () => { setMobileOpen(false); if (onHome) scrollToId("hero"); else navigate("/portfolio"); };

  return (
    <>
      {/* Scroll progress bar */}
      <div className="fixed top-0 left-0 right-0 h-0.5 z-[60] bg-transparent">
        <motion.div
          className="h-full bg-gradient-to-r from-accent via-violet-500 to-accent"
          style={{ width: `${scrollProgress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled || !onHome
            ? "bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-slate-200/60 dark:border-white/8 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={goLogo}
            className="flex items-center gap-1 text-lg font-bold tracking-tight group"
          >
            <span className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-white text-xs font-black">V</span>
            <span className="text-slate-800 dark:text-white group-hover:text-accent transition-colors duration-200">Kannaujiya</span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                onClick={() => handleItem(item)}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive(item)
                    ? "text-accent"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {isActive(item) && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-accent/10 dark:bg-accent/12 rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-200"
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            <button
              onClick={goHire}
              className="hidden md:inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-accent text-white text-sm font-semibold hover:bg-accent/90 active:scale-95 transition-all duration-200 shadow-lg shadow-accent/25"
            >
              Hire Me
            </button>

            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition"
              aria-label="Open menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="fixed top-[65px] left-0 right-0 z-40 bg-white dark:bg-[#0a0a0a] border-b border-slate-200 dark:border-white/10 shadow-2xl md:hidden overflow-hidden"
          >
            <div className="flex flex-col p-4 gap-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleItem(item)}
                  className={`text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isActive(item)
                      ? "bg-accent/10 text-accent"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={goHire}
                className="mt-2 px-4 py-3 rounded-xl bg-accent text-white font-semibold text-center active:scale-95 transition-all"
              >
                Hire Me
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
