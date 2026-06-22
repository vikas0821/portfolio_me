import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import ResumeVariants from "./pages/ResumeVariants";
import ResumeEditor from "./pages/ResumeEditor";
import Apply from "./pages/Apply";
import Applications from "./pages/Applications";
import EmailTemplates from "./pages/EmailTemplates";
import EmailComposer from "./pages/EmailComposer";
import "./index.css";

// Mounted at /resume-builder/* in the portfolio router — nested routes are
// relative to that prefix. Auth is handled by the portfolio gate (no Login here).
export default function ResumeApp() {
  return (
    <div className="resume-root flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
        <Routes>
          <Route path="" element={<Dashboard />} />
          <Route path="variants" element={<ResumeVariants />} />
          <Route path="resumes" element={<ResumeEditor />} />
          <Route path="resumes/:id" element={<ResumeEditor />} />
          <Route path="apply" element={<Apply />} />
          <Route path="applications" element={<Applications />} />
          <Route path="email/:applicationId" element={<EmailComposer />} />
          <Route path="email-templates" element={<EmailTemplates />} />
        </Routes>
      </main>
    </div>
  );
}
