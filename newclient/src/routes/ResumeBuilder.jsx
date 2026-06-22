import { lazy, Suspense } from "react";
import { FileText } from "lucide-react";
import AppGate from "../components/AppGate";
import { resumeLogin } from "../api/appsService";

const ResumeApp = lazy(() => import("../apps/resume/ResumeApp.jsx"));

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0a] text-slate-500 dark:text-slate-300">
    <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
  </div>
);

export default function ResumeBuilder() {
  return (
    <AppGate
      title="Resume Builder"
      subtitle="My private resume builder & job tracker — owner only."
      tokenKey="resume_token"
      onLogin={resumeLogin}
      afterAuth={(d) => { if (d.resumeToken) localStorage.setItem("token", d.resumeToken); }}
      icon={<FileText size={24} />}
    >
      <Suspense fallback={<Loading />}>
        <ResumeApp />
      </Suspense>
    </AppGate>
  );
}
