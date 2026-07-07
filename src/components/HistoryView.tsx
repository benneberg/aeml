import React, { useState } from "react";
import { 
  History, 
  Search, 
  ExternalLink, 
  Database, 
  Cpu, 
  Shield, 
  AlertTriangle, 
  X,
  User,
  Calendar,
  CheckCircle2,
  Clock,
  AlertOctagon
} from "lucide-react";
import { PullRequestDecision } from "../types";

interface HistoryViewProps {
  history: PullRequestDecision[];
}

export default function HistoryView({ history }: HistoryViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAudit, setSelectedAudit] = useState<PullRequestDecision | null>(null);

  // Search filter
  const filteredHistory = history.filter(
    h => 
      h.repo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="space-y-4" id="history-container">
      {/* Search Bar */}
      <div className="relative" id="history-search-bar">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search by repo, author, or keyword..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-sans text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* History Stream */}
      <div className="space-y-3" id="history-scans-feed">
        <div className="flex items-center space-x-1.5 pb-1 text-slate-400">
          <History className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-wider">AEML Audit Ledger</span>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-slate-100" id="empty-history">
            <p className="text-xs text-slate-400 font-sans">No code audits found matching search filters.</p>
          </div>
        ) : (
          filteredHistory.map((audit) => (
            <div 
              key={audit.id}
              onClick={() => setSelectedAudit(audit)}
              className="bg-white rounded-xl p-4 border border-slate-100 shadow-2xs hover:border-slate-200 transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="space-y-1.5 flex-1 pr-3">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    {new Date(audit.timestamp).toLocaleDateString()}
                  </span>
                  <span className="text-[10px] font-mono text-indigo-500 bg-indigo-50 px-1.5 py-0.2 rounded font-bold uppercase">
                    {audit.repo}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 leading-tight">
                  {audit.title}
                </h4>
                <div className="flex items-center space-x-3 text-[10px] text-slate-500 font-sans">
                  <span>Author: {audit.author}</span>
                  <span>•</span>
                  <span>{audit.issues.length} Issues</span>
                </div>
              </div>

              <div className="flex flex-col items-end space-y-1 shrink-0">
                <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full border uppercase ${getVerdictStyle(audit.verdict)}`}>
                  {audit.verdict}
                </span>
                <span className="text-[10px] font-bold text-slate-700 font-mono">
                  RISK: {audit.riskScore}/100
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detailed Report Audit Modal overlay */}
      {selectedAudit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg h-[85vh] flex flex-col overflow-hidden shadow-2xl relative">
            
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 flex items-start justify-between">
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono text-indigo-400 font-bold uppercase tracking-wider">
                  Audit Record ID: {selectedAudit.id}
                </span>
                <h3 className="text-sm font-bold tracking-tight">
                  {selectedAudit.title}
                </h3>
                <p className="text-[10px] text-slate-400 font-sans font-medium">
                  {selectedAudit.repo} • Compiled {new Date(selectedAudit.timestamp).toLocaleString()}
                </p>
              </div>
              <button 
                onClick={() => setSelectedAudit(null)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Contents */}
            <div className="p-4 space-y-5 overflow-y-auto flex-1 bg-slate-50">
              
              {/* Verdict Summary Panel */}
              <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-3xs flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400 font-mono uppercase tracking-wider font-bold">Consensus Verdict</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border-2 uppercase ${getVerdictStyle(selectedAudit.verdict)}`}>
                      {selectedAudit.verdict}
                    </span>
                    <span className="text-xs font-bold text-slate-700 font-mono">
                      Risk: {selectedAudit.riskScore}/100
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 italic flex-1 pl-4 text-right">
                  "{selectedAudit.executiveSummary}"
                </p>
              </div>

              {/* Roles Summary */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CTO Review Verdicts</h4>
                
                {/* Backend CTO */}
                <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-3xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                      <Database className="h-3.5 w-3.5 text-blue-500" />
                      <span>Backend CTO</span>
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${getVerdictStyle(selectedAudit.backendCTO.verdict)}`}>
                      {selectedAudit.backendCTO.verdict}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-sans">{selectedAudit.backendCTO.reasoning}</p>
                </div>

                {/* Security CTO */}
                <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-3xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                      <Shield className="h-3.5 w-3.5 text-rose-500" />
                      <span>Security CTO</span>
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${getVerdictStyle(selectedAudit.securityCTO.verdict)}`}>
                      {selectedAudit.securityCTO.verdict}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-sans">{selectedAudit.securityCTO.reasoning}</p>
                </div>

                {/* Infrastructure CTO */}
                <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-3xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                      <Cpu className="h-3.5 w-3.5 text-amber-500" />
                      <span>Infrastructure CTO</span>
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${getVerdictStyle(selectedAudit.infrastructureCTO.verdict)}`}>
                      {selectedAudit.infrastructureCTO.verdict}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-sans">{selectedAudit.infrastructureCTO.reasoning}</p>
                </div>
              </div>

              {/* AST Findings Feed */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Static Analysis Findings</h4>
                <div className="space-y-2">
                  {selectedAudit.issues.map((issue, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-lg border border-slate-100 shadow-3xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-slate-500 font-mono font-bold">
                          {issue.file}:{issue.line}
                        </span>
                        <span className={`text-[9px] font-bold font-mono px-1.5 py-0.2 rounded border ${getSeverityStyle(issue.severity)}`}>
                          {issue.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-800 font-sans font-medium">{issue.description}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-end">
              <button 
                onClick={() => setSelectedAudit(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-1.5 px-4 rounded-xl font-sans"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
