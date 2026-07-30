import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { Toaster } from "react-hot-toast";
import PortfolioHome from "./routes/portfolioHome";
import Studio from "./routes/Studio";
import AdminPage from "./routes/AdminPage";
import BlogPage from "./routes/BlogPage";
import BlogPostPage from "./routes/BlogPostPage";
import NotesPage from "./routes/NotesPage";
import OptionAnalysis from "./routes/OptionAnalysis";
import ResumeBuilder from "./routes/ResumeBuilder";
import Navbar from "./features/portfolio/Navbar";

// Persistent portfolio navbar — shown only on the public site (portfolio + blog).
// Hidden on the private studio launcher and the full-screen app routes.
const PRIVATE = ["/studio", "/admin", "/notes", "/option-analysis", "/resume-builder"];
const ChromeNavbar = () => {
  const { pathname } = useLocation();
  const hidden = PRIVATE.some((p) => pathname.startsWith(p));
  return hidden ? null : <Navbar />;
};

const App = () => (
  <MotionConfig reducedMotion="user">
    <ChromeNavbar />
    <Routes>
      {/* Public site — the front door is the portfolio */}
      <Route path="/" element={<PortfolioHome />} />
      <Route path="/portfolio" element={<Navigate to="/" replace />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:slug" element={<BlogPostPage />} />
      {/* Private workspace */}
      <Route path="/studio" element={<Studio />} />
      <Route path="/notes" element={<NotesPage />} />
      <Route path="/option-analysis" element={<OptionAnalysis />} />
      <Route path="/resume-builder/*" element={<ResumeBuilder />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "var(--toast-bg, #1f1f1f)",
          color: "var(--toast-text, #fff)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "12px",
          fontSize: "14px",
        },
      }}
    />
  </MotionConfig>
);

export default App;
