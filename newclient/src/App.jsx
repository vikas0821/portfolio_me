import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Hub from "./routes/Hub";
import PortfolioHome from "./routes/portfolioHome";
import AdminPage from "./routes/AdminPage";
import BlogPage from "./routes/BlogPage";
import BlogPostPage from "./routes/BlogPostPage";
import NotesPage from "./routes/NotesPage";
import OptionAnalysis from "./routes/OptionAnalysis";
import ResumeBuilder from "./routes/ResumeBuilder";
import Navbar from "./features/portfolio/Navbar";

// Persistent portfolio navbar — shown only on the portfolio + blog pages.
// Hidden on the hub launcher and the full-screen app routes (own layouts).
const FULL_SCREEN = ["/admin", "/notes", "/option-analysis", "/resume-builder"];
const ChromeNavbar = () => {
  const { pathname } = useLocation();
  const hidden = pathname === "/" || FULL_SCREEN.some((p) => pathname.startsWith(p));
  return hidden ? null : <Navbar />;
};

const App = () => (
  <>
    <ChromeNavbar />
    <Routes>
      <Route path="/" element={<Hub />} />
      <Route path="/portfolio" element={<PortfolioHome />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:slug" element={<BlogPostPage />} />
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
  </>
);

export default App;
