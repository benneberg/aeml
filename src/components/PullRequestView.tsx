import React, { useState } from "react";
import { 
  GitPullRequest, 
  User, 
  Calendar, 
  Terminal, 
  ShieldAlert, 
  CheckCircle2, 
  AlertOctagon, 
  XOctagon, 
  ArrowLeft, 
  Clock, 
  FileCode, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  HelpCircle,
  Database,
  Cpu,
  Shield,
  Search
} from "lucide-react";
import { PullRequest, PullRequestDecision, Issue } from "../types";

interface PullRequestViewProps {
  prs: PullRequest[];
  onTriggerAnalysis: (prId: string) => Promise<void>;
  onTriggerCustomAnalysis: (title: string, repo: string, diff: string) => Promise<void>;
  analysisResult: PullRequestDecision | null;
  loadingPrId: string | null;
  onBackToDashboard: () => void;
  darkMode?: boolean;
}

export default function PullRequestView({ 
  prs, 
  onTriggerAnalysis, 
  onTriggerCustomAnalysis,
  analysisResult, 
  loadingPrId,
  onBackToDashboard,
  darkMode = false
}: PullRequestViewProps) {
  const [selectedPr, setSelectedPr] = useState<PullRequest | null>(null);
  const [activeRoleTab, setActiveRoleTab] = useState<"backend" | "security" | "infrastructure">("backend");
  const [showFullDiff, setShowFullDiff] = useState(false);

  // Custom scanner form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [customRepo, setCustomRepo] = useState("auth-service");
  const [customTitle, setCustomTitle] = useState("OAuth2 cryptographic validation middleware");
  const [customDiff, setCustomDiff] = useState("");

  // Demos/Templates for quick scanning
  const jwtBypassDiff = `diff --git a/src/middleware/auth.ts b/src/middleware/auth.ts
index c6b9f2d..a82bc19 100644
--- a/src/middleware/auth.ts
+++ b/src/middleware/auth.ts
@@ -12,4 +12,12 @@ export async function validateToken(req: Request, res: Response, next: NextFunct
+    // Crypt bypass for rapid testing
+    if (process.env.NODE_ENV === 'development') {
+        req.user = jwt.decode(token); // Unverified decode bypass!
+        return next();
+    }`;

  const sqlInjectionDiff = `diff --git a/src/db/pool.ts b/src/db/pool.ts
index f1b3e1a..e2d9b2b 100644
--- a/src/db/pool.ts
+++ b/src/db/pool.ts
@@ -8,2 +8,11 @@ export const dbPool = new Pool({
+  max: 500, // connection pool inflated
 });
+export async function fetchAllUserInvoices(userId: string) {
+  const query = "SELECT * FROM invoices WHERE user_id = " + userId; // Unescaped raw SQL concatenation
+  const client = await dbPool.connect();
+  const res = await client.query(query);
+  client.release();
+  return res.rows;
+}`;

  const safeQueueDiff = `diff --git a/src/dispatch.ts b/src/dispatch.ts
index e234a5d..f82b71a 100644
--- a/src/dispatch.ts
+++ b/src/dispatch.ts
@@ -3,2 +3,5 @@ export async function dispatchAlert(message: string, userId: string) {
+  const queuePayload = JSON.stringify({ message, userId, timestamp: new Date() });
+  await queueClient.send('alerts-queue', queuePayload);`;

  // Filter issues by severity
  const getIssuesBySeverity = (issues: Issue[], severity: string) => {
    return issues.filter(i => i.severity.toUpperCase() === severity.toUpperCase());
  };

  const handlePrClick = async (pr: PullRequest) => {
    setSelectedPr(pr);
    setShowFullDiff(false);
    // If the selected PR doesn't have an active analyzed report loaded or belongs to another, trigger first review
    if (!analysisResult || analysisResult.prId !== pr.id) {
      await onTriggerAnalysis(pr.id);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDiff.trim()) {
      alert("Please paste a git diff or code payload to analyze.");
      return;
    }
    const virtualPR: PullRequest = {
      id: "custom-" + Date.now().toString().slice(-4),
      title: customTitle,
      repo: customRepo,
      author: "developer.local",
      createdAt: new Date().toISOString(),
      status: "UNDER_REVIEW",
      diff: customDiff
    };
    setSelectedPr(virtualPR);
    setIsFormOpen(false);
    await onTriggerCustomAnalysis(customTitle, customRepo, customDiff);
  };

  const getVerdictStyle = (verdict: string) => {
    switch (verdict?.toUpperCase()) {
      case "APPROVE":
      case "APPROVED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "HOLD":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "BLOCK":
      case "BLOCKED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case "CRITICAL": return "text-rose-700 bg-rose-50 border-rose-200";
      case "HIGH": return "text-orange-700 bg-orange-50 border-orange-200";
      case "MEDIUM": return "text-amber-700 bg-amber-50 border-amber-200";
      case "LOW": return "text-slate-700 bg-slate-50 border-slate-200";
      default: return "text-slate-700 bg-slate-50 border-slate-200";
    }
  };

  if (selectedPr) {
    const isCurrentPrLoading = loadingPrId === selectedPr.id;
    const report = (!isCurrentPrLoading && analysisResult?.prId === selectedPr.id) ? analysisResult : null;

    return (
      <div className="space-y-6" id="pr-detail-view">
        {/* Navigation Header */}
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-100" id="pr-nav-header">
          <button 
            onClick={() => { setSelectedPr(null); onBackToDashboard(); }}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase font-semibold">
              Reviewing Pull Request #{selectedPr.id}
            </span>
            <h3 className="text-base font-bold text-slate-900 leading-tight">
              {selectedPr.repo}
            </h3>
          </div>
        </div>

        {/* PR Basic Metadata Card */}
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-3xs" id="pr-meta-card">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <div className="flex items-center space-x-2">
                <span className="p-1 bg-indigo-50 text-indigo-600 rounded-md">
                  <GitPullRequest className="h-4 w-4" />
                </span>
                <h4 className="text-sm font-bold text-slate-900 leading-tight font-sans">
                  {selectedPr.title}
                </h4>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-500 text-[11px] font-sans pt-2 pl-7">
                <span className="flex items-center space-x-1">
                  <User className="h-3 w-3 text-slate-400" />
                  <span className="font-medium text-slate-700">{selectedPr.author}</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3 text-slate-400" />
                  <span>{new Date(selectedPr.createdAt).toLocaleDateString()}</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className={`font-mono text-[9px] font-bold px-1.5 py-0.2 rounded-sm border ${getVerdictStyle(selectedPr.status)}`}>
                  {selectedPr.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Loading and Evaluation Stage */}
        {isCurrentPrLoading && (
          <div className="bg-slate-900 text-slate-300 rounded-xl p-8 border border-slate-800 text-center space-y-4 shadow-lg animate-pulse" id="aeml-evaluator-loader">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-400 border-t-transparent"></div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-widest">AEML Review Pipeline Active</p>
              <h4 className="text-sm font-bold text-white">Consulting CTO Review Engine...</h4>
              <p className="text-[10px] text-slate-400 italic">Evaluating static structures, security AST rules, and domain models</p>
            </div>
            <div className="max-w-xs mx-auto text-left space-y-2 pt-2 border-t border-slate-800/60 font-mono text-[10px]">
              <div className="flex items-center justify-between text-indigo-300/80">
                <span>[1/4] Diff Collection & Tokenize</span>
                <span className="text-emerald-400">OK</span>
              </div>
              <div className="flex items-center justify-between text-indigo-300/80">
                <span>[2/4] Executing Static Analysis Rules</span>
                <span className="text-emerald-400">OK</span>
              </div>
              <div className="flex items-center justify-between text-indigo-300">
                <span>[3/4] Running Role Review Council</span>
                <span className="animate-pulse text-indigo-400">Processing...</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>[4/4] Decision Synthesizer Outcome</span>
                <span>Pending</span>
              </div>
            </div>
          </div>
        )}

        {/* AEML Outcome Report Panel */}
        {report && (
          <div className="space-y-5" id="aeml-report-outcome">
            
            {/* Header: Consolidated Verdict and Score Card */}
            <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-md flex items-center justify-between space-x-4" id="verdict-score-card">
              <div className="space-y-1 flex-1">
                <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase font-semibold">
                  AEML Governance Verdict
                </span>
                <div className="flex items-center space-x-2">
                  <span className={`text-base font-bold font-mono px-3 py-1 rounded-lg border-2 uppercase ${getVerdictStyle(report.verdict)}`}>
                    {report.verdict}
                  </span>
                  {report.verdict === "BLOCK" && (
                    <span className="text-xs font-bold text-rose-600 flex items-center space-x-1">
                      <AlertOctagon className="h-4 w-4" />
                      <span>Merge Blocked</span>
                    </span>
                  )}
                  {report.verdict === "HOLD" && (
                    <span className="text-xs font-bold text-amber-600 flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>Release Hold</span>
                    </span>
                  )}
                  {report.verdict === "APPROVE" && (
                    <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Ready for Prod</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 pt-2 font-sans italic leading-relaxed">
                  "{report.executiveSummary}"
                </p>
              </div>

              {/* Risk Gauge */}
              <div className="flex flex-col items-center shrink-0" id="risk-score-gauge">
                <div className="relative flex items-center justify-center">
                  {/* Circular progress background */}
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle cx="32" cy="32" r="28" stroke="#f1f5f9" strokeWidth="6" fill="transparent" />
                    <circle cx="32" cy="32" r="28" 
                      stroke={report.riskScore > 70 ? "#ef4444" : report.riskScore > 30 ? "#f59e0b" : "#10b981"} 
                      strokeWidth="6" 
                      fill="transparent" 
                      strokeDasharray={2 * Math.PI * 28}
                      strokeDashoffset={2 * Math.PI * 28 * (1 - report.riskScore / 100)} 
                    />
                  </svg>
                  <span className="absolute text-sm font-extrabold text-slate-800 font-mono">
                    {report.riskScore}
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mt-1">Risk Factor</span>
              </div>
            </div>

            {/* Role reviewer tab selector */}
            <div className="space-y-3" id="role-reviewer-council">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Role Reviewer Council
                </h4>
                <span className="text-[10px] text-indigo-500 font-semibold font-mono flex items-center space-x-1">
                  <Sparkles className="h-3 w-3" />
                  <span>Interactive Roles</span>
                </span>
              </div>

              {/* IOS Styled Tab Selector */}
              <div className="bg-slate-100 p-1 rounded-xl grid grid-cols-3 gap-1" id="role-tab-buttons">
                <button
                  onClick={() => setActiveRoleTab("backend")}
                  className={`py-2 rounded-lg text-xs font-semibold font-sans transition-all text-center ${
                    activeRoleTab === "backend" 
                      ? "bg-white text-indigo-600 shadow-xs" 
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Backend CTO
                </button>
                <button
                  onClick={() => setActiveRoleTab("security")}
                  className={`py-2 rounded-lg text-xs font-semibold font-sans transition-all text-center ${
                    activeRoleTab === "security" 
                      ? "bg-white text-indigo-600 shadow-xs" 
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Security CTO
                </button>
                <button
                  onClick={() => setActiveRoleTab("infrastructure")}
                  className={`py-2 rounded-lg text-xs font-semibold font-sans transition-all text-center ${
                    activeRoleTab === "infrastructure" 
                      ? "bg-white text-indigo-600 shadow-xs" 
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Infrastructure
                </button>
              </div>

              {/* Active Tab Panel */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-4" id="role-review-details">
                {activeRoleTab === "backend" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Database className="h-4 w-4" /></span>
                        <h5 className="text-sm font-bold text-slate-800">Backend CTO Verdict</h5>
                      </div>
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md border ${getVerdictStyle(report.backendCTO.verdict)}`}>
                        {report.backendCTO.verdict}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-sans bg-white p-3 rounded-lg border border-slate-100 shadow-3xs">
                      {report.backendCTO.reasoning}
                    </p>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Key Concerns</span>
                        {report.backendCTO.concerns.length === 0 ? (
                          <span className="text-xs text-slate-500 italic block">No critical architectural concerns flagged.</span>
                        ) : (
                          <ul className="space-y-1 list-disc list-inside">
                            {report.backendCTO.concerns.map((c, idx) => (
                              <li key={idx} className="text-xs text-slate-600 font-sans">{c}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Suggested Actions</span>
                        {report.backendCTO.suggestedActions.length === 0 ? (
                          <span className="text-xs text-slate-500 italic block">None required.</span>
                        ) : (
                          <ul className="space-y-1 list-disc list-inside">
                            {report.backendCTO.suggestedActions.map((a, idx) => (
                              <li key={idx} className="text-xs text-indigo-700 font-sans font-medium">{a}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-200/55 font-mono">
                      <span>Reviewer Confidence</span>
                      <span className="font-bold text-slate-700">{report.backendCTO.confidence}%</span>
                    </div>
                  </div>
                )}

                {activeRoleTab === "security" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg"><Shield className="h-4 w-4" /></span>
                        <h5 className="text-sm font-bold text-slate-800">Security CTO Verdict</h5>
                      </div>
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md border ${getVerdictStyle(report.securityCTO.verdict)}`}>
                        {report.securityCTO.verdict}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-sans bg-white p-3 rounded-lg border border-slate-100 shadow-3xs">
                      {report.securityCTO.reasoning}
                    </p>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Key Concerns</span>
                        {report.securityCTO.concerns.length === 0 ? (
                          <span className="text-xs text-slate-500 italic block">No cryptographic or compliance concerns.</span>
                        ) : (
                          <ul className="space-y-1 list-disc list-inside">
                            {report.securityCTO.concerns.map((c, idx) => (
                              <li key={idx} className="text-xs text-rose-800 font-sans font-medium bg-rose-50/50 px-1 rounded">{c}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Suggested Actions</span>
                        {report.securityCTO.suggestedActions.length === 0 ? (
                          <span className="text-xs text-slate-500 italic block">None required.</span>
                        ) : (
                          <ul className="space-y-1 list-disc list-inside">
                            {report.securityCTO.suggestedActions.map((a, idx) => (
                              <li key={idx} className="text-xs text-indigo-700 font-sans font-medium">{a}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-200/55 font-mono">
                      <span>Reviewer Confidence</span>
                      <span className="font-bold text-slate-700">{report.securityCTO.confidence}%</span>
                    </div>
                  </div>
                )}

                {activeRoleTab === "infrastructure" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg"><Cpu className="h-4 w-4" /></span>
                        <h5 className="text-sm font-bold text-slate-800">Infrastructure CTO Verdict</h5>
                      </div>
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md border ${getVerdictStyle(report.infrastructureCTO.verdict)}`}>
                        {report.infrastructureCTO.verdict}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-sans bg-white p-3 rounded-lg border border-slate-100 shadow-3xs">
                      {report.infrastructureCTO.reasoning}
                    </p>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Key Concerns</span>
                        {report.infrastructureCTO.concerns.length === 0 ? (
                          <span className="text-xs text-slate-500 italic block">No resource scale or cost issues.</span>
                        ) : (
                          <ul className="space-y-1 list-disc list-inside">
                            {report.infrastructureCTO.concerns.map((c, idx) => (
                              <li key={idx} className="text-xs text-slate-600 font-sans">{c}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Suggested Actions</span>
                        {report.infrastructureCTO.suggestedActions.length === 0 ? (
                          <span className="text-xs text-slate-500 italic block">None required.</span>
                        ) : (
                          <ul className="space-y-1 list-disc list-inside">
                            {report.infrastructureCTO.suggestedActions.map((a, idx) => (
                              <li key={idx} className="text-xs text-indigo-700 font-sans font-medium">{a}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-200/55 font-mono">
                      <span>Reviewer Confidence</span>
                      <span className="font-bold text-slate-700">{report.infrastructureCTO.confidence}%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* AST Static Analysis Findings Feed */}
            <div className="space-y-3" id="ast-issues-feed">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  AST Findings & Code Smells
                </h4>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-mono font-bold">
                  {report.issues.length} Identified
                </span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {report.issues.map((issue, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white rounded-lg p-3 border border-slate-100 shadow-3xs hover:border-slate-200 transition-all"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] text-slate-500 font-mono font-bold">
                        {issue.file}:{issue.line}
                      </span>
                      <span className={`text-[9px] font-bold font-mono px-1.5 py-0.2 rounded-sm border ${getSeverityStyle(issue.severity)}`}>
                        {issue.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 font-sans font-medium mb-1">
                      {issue.description}
                    </p>
                    <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono">
                      <span>Source: <strong className="text-slate-600">{issue.source}</strong></span>
                      <span>•</span>
                      <span>Category: <strong className="text-slate-600">{issue.category}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Code Diff Display */}
            <div className="bg-slate-950 text-white rounded-xl overflow-hidden shadow-md" id="pr-diff-block">
              <div className="bg-slate-900 px-4 py-2.5 flex items-center justify-between border-b border-slate-800">
                <span className="text-xs font-mono text-slate-400 flex items-center space-x-1.5">
                  <FileCode className="h-4 w-4 text-slate-400" />
                  <span>Interactive Git Diff Viewer</span>
                </span>
                <button 
                  onClick={() => setShowFullDiff(!showFullDiff)}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold uppercase tracking-wider font-sans focus:outline-none"
                >
                  {showFullDiff ? "Collapse" : "Expand Diff"}
                </button>
              </div>

              <div className={`overflow-x-auto text-xs font-mono p-4 ${showFullDiff ? "max-h-none" : "max-h-48"}`}>
                <pre className="text-slate-300 select-all leading-relaxed">
                  {selectedPr.diff.split('\n').map((line, i) => {
                    let lineClass = "text-slate-300";
                    if (line.startsWith('+') && !line.startsWith('+++')) lineClass = "text-emerald-400 bg-emerald-950/40 px-1";
                    if (line.startsWith('-') && !line.startsWith('---')) lineClass = "text-rose-400 bg-rose-950/40 px-1";
                    if (line.startsWith('@@')) lineClass = "text-cyan-400 bg-slate-900 px-1 py-0.5";
                    return (
                      <div key={i} className={`${lineClass} border-l-2 border-transparent`}>
                        {line}
                      </div>
                    );
                  })}
                </pre>
              </div>
            </div>

            {/* Developer Enforcement & Overrides */}
            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm space-y-3" id="pr-enforcement-panel">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Developer Enforcement Override</h4>
                <p className="text-[10px] text-slate-400">Bypass AEML gating results (requires security auditable log trace)</p>
              </div>

              <div className="flex gap-2">
                <button 
                  className="flex-1 bg-slate-900 text-white py-2 px-3 rounded-lg text-xs font-semibold hover:bg-slate-800 transition-all font-sans"
                  onClick={() => alert("Standard Merge triggers would hook into your GitHub actions context. Auditable log generated.")}
                >
                  Force Merge with Override
                </button>
                <button 
                  className="border border-slate-200 py-2 px-3 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all font-sans"
                  onClick={() => setSelectedPr(null)}
                >
                  Close PR Inspector
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4" id="prs-list-view">
      <div className={`flex items-center justify-between pb-2 border-b ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
        <div>
          <h3 className={`text-sm font-bold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>Review Pull Requests</h3>
          <p className="text-[10px] text-slate-400">Select active repository branch updates to evaluate</p>
        </div>
        <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${darkMode ? "bg-indigo-950 text-indigo-300" : "bg-indigo-50 text-indigo-600"}`}>
          {prs.length} Awaiting
        </span>
      </div>

      {/* Interactive Custom Scan Trigger Card */}
      <div className={`${darkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-slate-50 border-slate-200/60 text-slate-850"} rounded-xl p-4 space-y-3 shadow-3xs`} id="custom-scanner-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-indigo-500/10 text-indigo-500 rounded-lg">
              <Terminal className="h-4 w-4" />
            </span>
            <div>
              <h4 className={`text-xs font-bold uppercase tracking-wide ${darkMode ? "text-white" : "text-slate-900"}`}>AST Diff Sandbox Scanner</h4>
              <p className="text-[10px] text-slate-400 font-sans">Audit and evaluate custom snippets with the council</p>
            </div>
          </div>
          <button 
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 font-sans"
          >
            {isFormOpen ? "Close Scanner" : "Launch Sandbox"}
          </button>
        </div>

        {isFormOpen && (
          <form onSubmit={handleCustomSubmit} className="space-y-3 pt-2 border-t border-slate-200/40 animate-fadeIn" id="custom-scan-form">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Target Repository</label>
                <select 
                  value={customRepo}
                  onChange={(e) => setCustomRepo(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800 font-sans focus:outline-none"
                >
                  <option value="auth-service">auth-service</option>
                  <option value="billing-service">billing-service</option>
                  <option value="gateway-router">gateway-router</option>
                  <option value="notification-hub">notification-hub</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Branch / Title</label>
                <input 
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800 font-sans focus:outline-none"
                  placeholder="e.g. JWT refactor"
                />
              </div>
            </div>

            {/* Template Injectors */}
            <div className="space-y-1">
              <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Load Vulnerability Templates</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setCustomRepo("auth-service");
                    setCustomTitle("OAuth2 Token Validation bypass in dev");
                    setCustomDiff(jwtBypassDiff);
                  }}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-semibold px-2.5 py-1 rounded border border-rose-200 transition-all font-sans"
                >
                  [CRITICAL] JWT Crypt Bypass
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomRepo("billing-service");
                    setCustomTitle("Connection pool expansion & sequential billing audits");
                    setCustomDiff(sqlInjectionDiff);
                  }}
                  className="bg-amber-50 hover:bg-amber-100 text-amber-700 text-[10px] font-semibold px-2.5 py-1 rounded border border-amber-200 transition-all font-sans"
                >
                  [HIGH] SQL Inject & Pool Scale
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomRepo("notification-hub");
                    setCustomTitle("Dispatch dispatcher queues standard message conversion");
                    setCustomDiff(safeQueueDiff);
                  }}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-semibold px-2.5 py-1 rounded border border-emerald-200 transition-all font-sans"
                >
                  [SAFE] Standard Queue Dispatch
                </button>
              </div>
            </div>

            {/* Git Diff textarea */}
            <div>
              <label className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Git Diff Payload</label>
              <textarea 
                value={customDiff}
                onChange={(e) => setCustomDiff(e.target.value)}
                rows={6}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-[11px] font-mono text-slate-800 focus:outline-none placeholder-slate-400"
                placeholder="Paste git diff here, or click one of the templates above..."
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center space-x-1 transition-all"
            >
              <span>Submit Diff to Council</span>
            </button>
          </form>
        )}
      </div>

      {/* PR Queue List */}
      <div className="space-y-3">
        {prs.map((pr) => (
          <div 
            key={pr.id}
            onClick={() => handlePrClick(pr)}
            className={`rounded-xl p-4 border transition-all cursor-pointer flex items-center justify-between ${
              darkMode 
                ? "bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-850" 
                : "bg-white border-slate-100 shadow-2xs hover:border-indigo-100 hover:bg-slate-50/20"
            }`}
          >
            <div className="space-y-1.5 flex-1 pr-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-indigo-500 font-mono font-bold">#{pr.id}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                  darkMode ? "bg-slate-950 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-100 text-slate-500"
                }`}>
                  {pr.repo}
                </span>
              </div>
              <h4 className={`text-sm font-bold leading-tight tracking-tight hover:text-indigo-500 ${
                darkMode ? "text-white" : "text-slate-900"
              }`}>
                {pr.title}
              </h4>
              <div className="flex items-center space-x-2 text-[10px] text-slate-500">
                <span>By {pr.author}</span>
                <span>•</span>
                <span>{new Date(pr.createdAt).toLocaleTimeString()}</span>
              </div>
            </div>

            <div className="flex flex-col items-end space-y-2 shrink-0">
              <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full border uppercase ${getVerdictStyle(pr.status)}`}>
                {pr.status}
              </span>
              <span className="text-indigo-500 text-xs font-semibold flex items-center space-x-0.5">
                <span>Audit</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
