import { useEffect } from "react";
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

const PortfolioHome = () => {
  // Renders immediately with bundled fallback content and silently swaps in
  // live data once the (possibly cold-starting) backend responds.
  const { data } = usePortfolio();
  const location = useLocation();

  // When arriving from another page (e.g. /blog) with a section target, scroll to it.
  useEffect(() => {
    if (location.state?.scrollTo) {
      const id = location.state.scrollTo;
      const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 80);
      return () => clearTimeout(t);
    }
  }, [location.state]);

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
