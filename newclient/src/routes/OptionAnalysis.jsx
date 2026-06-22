import { lazy, Suspense } from "react";
import { LineChart } from "lucide-react";
import AppGate from "../components/AppGate";
import { optionLogin } from "../api/appsService";

const OptionApp = lazy(() => import("../apps/option/OptionApp.jsx"));

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a0e1a] text-slate-500 dark:text-slate-300">
    <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
  </div>
);

export default function OptionAnalysis() {
  return (
    <AppGate
      title="Option Analyzer"
      subtitle="Private — enter password to open"
      tokenKey="option_token"
      onLogin={optionLogin}
      icon={<LineChart size={24} />}
    >
      <Suspense fallback={<Loading />}>
        <OptionApp />
      </Suspense>
    </AppGate>
  );
}
