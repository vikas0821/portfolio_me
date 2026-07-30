import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import usePortfolio from "../hooks/usePortfolio";
import Hero from "../features/portfolio/Hero";
import Skills from "../features/portfolio/Skill";
import Projects from "../features/portfolio/Projects";
import Experience from "../features/portfolio/Experience";
import Education from "../features/portfolio/Education";
import Certifications from "../features/portfolio/Certifications";
import Contact from "../features/portfolio/Contact";
import Footer from "../features/portfolio/Footer";
import { downloadResumePdf } from "../lib/resume";

const LoadingSkeleton = () => {
  // Free hosting (Render) sleeps when idle; the first request can take ~30s.
  // After a short wait, reassure the visitor that nothing is broken.
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 6000);
    return () => clearTimeout(t);
  }, []);
  return (
  <div className="min-h-screen bg-paper halftone-bg flex items-center justify-center px-6">
    <div className="comic-panel text-center space-y-4 max-w-xs p-8 -rotate-1">
      <div className="relative mx-auto w-14 h-14">
        <div className="absolute inset-0 rounded-full border-[3px] border-ink/15" />
        <div className="absolute inset-0 rounded-full border-[3px] border-t-accent animate-spin" />
        <div className="absolute inset-2 rounded-full bg-comic-yellow border-2 border-ink flex items-center justify-center">
          <span className="text-ink font-display text-sm">V</span>
        </div>
      </div>
      <div>
        <p className="font-display text-lg tracking-wide text-ink dark:text-white">
          {slow ? "Waking up the server…" : "Loading portfolio"}
        </p>
        <p className="text-xs text-ink/50 dark:text-white/50 mt-1.5 leading-relaxed font-sans">
          {slow ? "Free hosting sleeps when idle — the first load can take up to ~30s. Thanks for your patience!" : "Please wait..."}
        </p>
      </div>
    </div>
  </div>
  );
};

const ErrorState = ({ message }) => (
  <div className="min-h-screen bg-paper halftone-bg flex items-center justify-center px-6">
    <div className="comic-panel text-center max-w-md p-8">
      <div className="w-16 h-16 rounded-2xl bg-comic-red border-[3px] border-ink flex items-center justify-center mx-auto mb-6 rotate-3">
        <span className="text-3xl">⚠️</span>
      </div>
      <h2 className="font-display text-2xl tracking-wide text-ink dark:text-white mb-3">Uh oh, something broke</h2>
      <p className="text-ink/60 dark:text-white/60 text-sm mb-6 leading-relaxed font-sans">{message}</p>
      <button
        onClick={() => window.location.reload()}
        className="wobble-hover px-6 py-3 rounded-xl bg-accent border-[3px] border-ink text-white font-display tracking-wide shadow-comic-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
      >
        Try Again
      </button>
    </div>
  </div>
);

const PortfolioHome = () => {
  const { data, loading, error } = usePortfolio();
  const location = useLocation();

  // When arriving from another page (e.g. /blog) with a section target, scroll to it.
  useEffect(() => {
    if (!loading && location.state?.scrollTo) {
      const id = location.state.scrollTo;
      const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 80);
      return () => clearTimeout(t);
    }
  }, [loading, location.state]);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} />;
  if (!data) return <ErrorState message="No portfolio data available." />;

  const settings = data.settings || {};
  const sec = settings.sections || {};

  return (
    <motion.div
      id="main"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Hero hero={data.hero} settings={settings} onDownloadResume={() => downloadResumePdf(data)} />
      <Skills skills={data.skills} meta={sec.skills} />
      <Projects projects={data.projects} meta={sec.projects} />
      <Experience experience={data.experience} meta={sec.experience} />
      <Education education={data.education} meta={sec.education} />
      <Certifications certifications={data.certifications} meta={sec.certifications} />
      <Contact contact={data.contact} meta={sec.contact} />
      <Footer contact={data.contact} settings={settings} />
    </motion.div>
  );
};

export default PortfolioHome;
