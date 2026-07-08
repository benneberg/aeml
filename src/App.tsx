import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Layers, 
  GitPullRequest, 
  History as HistoryIcon, 
  FileText, 
  Bell, 
  Activity, 
  Compass,
  Laptop
} from "lucide-react";
import DashboardView from "./components/DashboardView";
import PullRequestView from "./components/PullRequestView";
import HistoryView from "./components/HistoryView";
import SpecView from "./components/SpecView";
import { Repository, PullRequest, PullRequestDecision, SystemAlert, ExecutiveMetrics } from "./types";
// @ts-ignore
import aemlLogo from "./assets/images/aeml_logo_1783466577231.jpg";

export default function App() {
  // Mobile app tabs
  const [activeTab, setActiveTab] = useState<"dashboard" | "reviews" | "history" | "spec">("dashboard");

  // Core domain states
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [prs, setPrs] = useState<PullRequest[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [reviewHistory, setReviewHistory] = useState<PullRequestDecision[]>([]);
  const [metrics, setMetrics] = useState<ExecutiveMetrics | null>(null);

  // Loading and analysis states
  const [loading, setLoading] = useState(true);
  const [loadingPrId, setLoadingPrId] = useState<string | null>(null);
  const [activeAnalysis, setActiveAnalysis] = useState<PullRequestDecision | null>(null);

  // Error logging state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch initial organizational context from AEML backend APIs
  const fetchAllContext = async () => {
    try {
      setLoading(true);
      const [reposRes, prsRes, alertsRes, reviewsRes, metricsRes] = await Promise.all([
        fetch("/api/repositories"),
        fetch("/api/pull-requests"),
        fetch("/api/alerts"),
        fetch("/api/reviews"),
        fetch("/api/metrics")
      ]);

      const repos = await reposRes.json();
      const prList = await prsRes.json();
      const alertList = await alertsRes.json();
      const reviewHistoryList = await reviewsRes.json();
      const metricList = await metricsRes.json();

      setRepositories(repos);
      setPrs(prList);
      setAlerts(alertList);
      setReviewHistory(reviewHistoryList);
      setMetrics(metricList);
      setErrorMessage(null);
    } catch (err) {
      console.error("AEML: Failed to retrieve contextual APIs: ", err);
      setErrorMessage("Network sync failed. Verify local backend node is online.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllContext();
  }, []);

  // Launch role reviewer analysis on target Pull Request (called when a PR is opened)
  const handleTriggerAnalysis = async (prId: string) => {
    try {
      setLoadingPrId(prId);
      const res = await fetch("/api/reviews/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prId })
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const data = await res.json();
      setActiveAnalysis(data);

      // Re-trigger metric and history fetches to keep UI completely in-sync
      const historyRes = await fetch("/api/reviews");
      const metricsRes = await fetch("/api/metrics");
      setReviewHistory(await historyRes.json());
      setMetrics(await metricsRes.json());
    } catch (err: any) {
      console.error("AEML Analysis Error: ", err);
      alert("AEML analyzer failed to complete: " + (err.message || err));
    } finally {
      setLoadingPrId(null);
    }
  };

  // Launch role reviewer analysis on CUSTOM git diff (called when pasted custom code is analyzed)
  const handleTriggerCustomAnalysis = async (title: string, repo: string, diff: string) => {
    try {
      setLoadingPrId("custom");
      const res = await fetch("/api/reviews/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customTitle: title, customRepo: repo, customDiff: diff })
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const data = await res.json();
      setActiveAnalysis(data);

      // Refresh standard historical listings
      const historyRes = await fetch("/api/reviews");
      const metricsRes = await fetch("/api/metrics");
      setReviewHistory(await historyRes.json());
      setMetrics(await metricsRes.json());
    } catch (err: any) {
      console.error("AEML Custom Analysis Error: ", err);
      alert("Custom diff analyzer failed: " + (err.message || err));
    } finally {
      setLoadingPrId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900/10 flex items-center justify-center font-sans py-0 md:py-8" id="root-viewport">
      
      {/* Premium Desktop Mock Mobile Shell Container wrapper */}
      <div className="w-full max-w-[440px] h-[100vh] md:h-[840px] bg-slate-50 md:rounded-[40px] md:shadow-2xl border-0 md:border-[10px] border-slate-900 overflow-hidden flex flex-col relative" id="mobile-shell">
        
        {/* iOS Dynamic Status Notch Accent (visible only in desktop wrappers) */}
        <div className="hidden md:flex bg-slate-900 h-6 items-center justify-center relative shrink-0 z-50">
          <div className="w-24 h-4 bg-black rounded-b-xl absolute top-0"></div>
        </div>

        {/* Dynamic Global Top Navigation Bar */}
        <header className="bg-white border-b border-slate-100 px-5 py-3.5 flex items-center justify-between shrink-0 z-10 shadow-3xs" id="app-header">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg overflow-hidden border border-slate-100 shadow-xs flex items-center justify-center bg-slate-50 relative shrink-0">
              <img 
                src={aemlLogo} 
                alt="AEML Governance Logo" 
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer" 
              />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-slate-900 tracking-tight leading-none uppercase flex items-center space-x-1">
                <span>AEML Governance</span>
              </h1>
              <span className="text-[9px] text-slate-400 font-mono">Simulated Org Manager</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button 
              onClick={fetchAllContext}
              title="Synchronize Governance APIs"
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-all flex items-center justify-center"
            >
              <Activity className="h-4 w-4" />
            </button>
            <div className="relative">
              <span className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-all flex items-center justify-center">
                <Bell className="h-4 w-4" />
              </span>
              {alerts.length > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
              )}
            </div>
          </div>
        </header>

        {/* Primary Content Container */}
        <main className="flex-1 overflow-y-auto px-5 py-4 bg-slate-50/50 relative scroll-smooth" id="app-content">
          
          {errorMessage && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 text-xs font-medium mb-4" id="global-error">
              {errorMessage}
            </div>
          )}

          {loading && !metrics ? (
            <div className="h-full flex flex-col items-center justify-center space-y-3" id="global-loader">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent"></div>
              <p className="text-xs text-slate-500 font-medium font-sans">Synthesizing organization metadata...</p>
            </div>
          ) : (
            <>
              {activeTab === "dashboard" && metrics && (
                <DashboardView 
                  metrics={metrics}
                  alerts={alerts}
                  onSelectPR={() => setActiveTab("reviews")}
                  activeTab={activeTab}
                />
              )}

              {activeTab === "reviews" && (
                <PullRequestView 
                  prs={prs}
                  onTriggerAnalysis={handleTriggerAnalysis}
                  onTriggerCustomAnalysis={handleTriggerCustomAnalysis}
                  analysisResult={activeAnalysis}
                  loadingPrId={loadingPrId}
                  onBackToDashboard={() => setActiveTab("dashboard")}
                />
              )}

              {activeTab === "history" && (
                <HistoryView 
                  history={reviewHistory}
                />
              )}

              {activeTab === "spec" && (
                <SpecView />
              )}
            </>
          )}
        </main>

        {/* Global Bottom Navigation Tab Bar */}
        <nav className="bg-white border-t border-slate-100 px-4 py-2 flex justify-between items-center shrink-0 shadow-md pb-4 md:pb-3" id="app-navigation">
          
          <button 
            onClick={() => setActiveTab("dashboard")}
            className={`flex flex-col items-center space-y-0.5 flex-1 py-1 transition-all ${
              activeTab === "dashboard" ? "text-indigo-600" : "text-slate-400 hover:text-slate-700"
            }`}
          >
            <Layers className="h-5 w-5" />
            <span className="text-[10px] font-bold font-sans tracking-tight">Dashboard</span>
          </button>

          <button 
            onClick={() => setActiveTab("reviews")}
            className={`flex flex-col items-center space-y-0.5 flex-1 py-1 transition-all relative ${
              activeTab === "reviews" ? "text-indigo-600" : "text-slate-400 hover:text-slate-700"
            }`}
          >
            <GitPullRequest className="h-5 w-5" />
            <span className="text-[10px] font-bold font-sans tracking-tight">Reviews</span>
            {prs.length > 0 && (
              <span className="absolute top-1 right-6 bg-indigo-600 text-white font-extrabold text-[8px] h-3.5 w-3.5 flex items-center justify-center rounded-full">
                {prs.length}
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab("history")}
            className={`flex flex-col items-center space-y-0.5 flex-1 py-1 transition-all ${
              activeTab === "history" ? "text-indigo-600" : "text-slate-400 hover:text-slate-700"
            }`}
          >
            <HistoryIcon className="h-5 w-5" />
            <span className="text-[10px] font-bold font-sans tracking-tight">Ledger</span>
          </button>

          <button 
            onClick={() => setActiveTab("spec")}
            className={`flex flex-col items-center space-y-0.5 flex-1 py-1 transition-all ${
              activeTab === "spec" ? "text-indigo-600" : "text-slate-400 hover:text-slate-700"
            }`}
          >
            <FileText className="h-5 w-5" />
            <span className="text-[10px] font-bold font-sans tracking-tight">Spec</span>
          </button>

        </nav>

        {/* iOS Home Indicator Bar Accent */}
        <div className="hidden md:block bg-white h-3 pb-2 shrink-0 z-20">
          <div className="w-32 h-1 bg-slate-300 rounded-full mx-auto"></div>
        </div>

      </div>
    </div>
  );
}
