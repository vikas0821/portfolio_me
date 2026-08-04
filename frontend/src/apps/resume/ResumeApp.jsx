import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "./components/Sidebar";
import ResumeEditor from "./pages/ResumeEditor";
import Apply from "./pages/Apply";
import Applications from "./pages/Applications";
import EmailTemplates from "./pages/EmailTemplates";
import EmailComposer from "./pages/EmailComposer";
import "./index.css";

// Mounted at /resume-builder/* in the portfolio router — nested routes are
// relative to that prefix. Auth is handled by the portfolio gate (no Login here).
export default function ResumeApp() {
  const [open, setOpen] = useState(false);

  return (
    <div className="resume-root flex min-h-screen">
      <Sidebar open={open} onClose={() => setOpen(false)} />

      {/* Mobile overlay */}
      {open && (
        <div onClick={() => setOpen(false)} className="lg:hidden fixed inset-0 z-30 bg-black/50" />
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-20 flex items-center gap-3 h-14 px-4 bg-paper border-b-[3px] border-ink dark:border-white/70">
          <button onClick={() => setOpen(true)} aria-label="Open menu" className="p-2 -ml-2 rounded-lg text-ink/70 dark:text-white/70 hover:bg-ink/5 dark:hover:bg-white/5">
            <Menu size={20} />
          </button>
          <span className="font-display text-base tracking-wide text-ink dark:text-white">Resume OS</span>
        </div>

        <main className="flex-1 p-4 sm:p-6 max-w-6xl mx-auto w-full">
          <Routes>
            <Route path="" element={<Navigate to="applications" replace />} />
            <Route path="resumes" element={<ResumeEditor />} />
            <Route path="apply" element={<Apply />} />
            <Route path="applications" element={<Applications />} />
            <Route path="email/:applicationId" element={<EmailComposer />} />
            <Route path="email-templates" element={<EmailTemplates />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
