import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import PortfolioHome from "./routes/portfolioHome";
import AdminPage from "./routes/AdminPage";
import BlogPage from "./routes/BlogPage";
import BlogPostPage from "./routes/BlogPostPage";
import NotesPage from "./routes/NotesPage";
import Navbar from "./features/portfolio/Navbar";

// Persistent navbar — mounted once so it doesn't remount/re-animate on route
// changes. Hidden on the admin dashboard (which has its own layout).
const ChromeNavbar = () => {
  const { pathname } = useLocation();
  const hidden = pathname.startsWith("/admin") || pathname.startsWith("/notes");
  return hidden ? null : <Navbar />;
};

const App = () => (
  <>
    <ChromeNavbar />
    <Routes>
      <Route path="/" element={<PortfolioHome />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:slug" element={<BlogPostPage />} />
      <Route path="/notes" element={<NotesPage />} />
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
