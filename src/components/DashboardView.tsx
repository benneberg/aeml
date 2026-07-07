import React from "react";
import { 
  Shield, 
  Activity, 
  AlertTriangle, 
  Layers, 
  CheckCircle, 
  Flame, 
  TrendingUp, 
  Clock, 
  ArrowRight,
  GitBranch
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell 
} from "recharts";
import { Repository, SystemAlert, ExecutiveMetrics } from "../types";

interface DashboardViewProps {
  metrics: ExecutiveMetrics;
  alerts: SystemAlert[];
  onSelectPR: () => void;
  activeTab: string;
}

export default function DashboardView({ metrics, alerts, onSelectPR, activeTab }: DashboardViewProps) {
  // Mock data for weekly risk trend
  const trendData = [
    { name: "Mon", risk: 42, compliance: 85 },
    { name: "Tue", risk: 38, compliance: 88 },
    { name: "Wed", risk: 55, compliance: 82 },
    { name: "Thu", risk: 48, compliance: 89 },
    { name: "Fri", risk: 31, compliance: 92 },
    { name: "Sat", risk: 29, compliance: 94 },
    { name: "Sun", risk: 34, compliance: 91 }
  ];

  // Helper to color security grades
  const getSecurityGradeColor = (grade: string) => {
    switch (grade) {
      case "A": return "text-emerald-500 bg-emerald-50 border-emerald-200";
      case "B": return "text-blue-500 bg-blue-50 border-blue-200";
      case "C": return "text-amber-500 bg-amber-50 border-amber-200";
      default: return "text-rose-500 bg-rose-50 border-rose-200";
    }
  };

  return (
    <div className="space-y-6" id="dashboard-container">
      {/* Top Banner with Local Status Indicator */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 relative overflow-hidden shadow-md" id="status-header">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-10 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
        
        <div className="flex items-center justify-between mb-3 relative z-10">
          <div className="flex items-center space-x-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-mono text-emerald-400 tracking-wider uppercase font-semibold">
              AEML Core Active
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">v0.1.0 (Draft)</span>
        </div>

        <h2 className="text-2xl font-bold tracking-tight mb-1">Engineering Leadership Dashboard</h2>
        <p className="text-sm text-slate-300">
          Simulating organization-wide architectural drift, security policies, and merge gates.
        </p>
      </div>

      {/* Primary Mobile Metrics Grid */}
      <div className="grid grid-cols-2 gap-3" id="executive-metrics-grid">
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs flex flex-col justify-between" id="metric-health">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Health Index</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                {metrics.engineeringHealthScore}%
              </span>
              <span className="text-xs font-semibold text-emerald-600 font-mono">+1.8%</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Weighted repo health average</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs flex flex-col justify-between" id="metric-compliance">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Policy Sync</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                {metrics.governanceComplianceRate}%
              </span>
              <span className="text-xs font-semibold text-indigo-600 font-mono">Optimal</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Corporate policy checks passed</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs flex flex-col justify-between" id="metric-debt">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Tech Debt</span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                {metrics.totalTechnicalDebt}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Hours</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Estimated remediation effort</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs flex flex-col justify-between" id="metric-incidents">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Incidents</span>
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                {metrics.incidentRateReduction}%
              </span>
              <span className="text-xs font-semibold text-rose-600 font-mono">Reduction</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Since launching AEML reviews</p>
          </div>
        </div>
      </div>

      {/* High Risk Alerts Banner */}
      {alerts && alerts.length > 0 && (
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 space-y-2" id="dashboard-alerts">
          <div className="flex items-center justify-between border-b border-rose-100/60 pb-2">
            <div className="flex items-center space-x-2 text-rose-800">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider font-sans">
                Active Governance Alerts
              </span>
            </div>
            <span className="text-[10px] bg-rose-200 text-rose-800 font-bold px-2 py-0.5 rounded-full font-mono">
              {alerts.length} Warnings
            </span>
          </div>
          <div className="space-y-2 mt-2">
            {alerts.map((alert) => (
              <div key={alert.id} className="text-xs text-rose-700 flex items-start space-x-1 font-sans">
                <span className="font-semibold tracking-tight text-rose-900">[{alert.repo}]</span>
                <span className="flex-1 text-rose-800/90">{alert.message}</span>
              </div>
            ))}
          </div>
          <button 
            onClick={onSelectPR}
            className="w-full mt-2 text-center text-xs font-semibold text-rose-800 flex items-center justify-center space-x-1 hover:underline pt-1 border-t border-rose-100/40"
          >
            <span>Review Pending Pull Requests</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Risk Trend Visualizers */}
      <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs" id="risk-chart-panel">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Repository Trend Analysis</h3>
            <p className="text-[10px] text-slate-400">Weekly risk scores vs governance policy sync</p>
          </div>
          <TrendingUp className="h-4 w-4 text-slate-400" />
        </div>
        
        <div className="h-44 w-full" id="risk-trend-chart">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
              <Tooltip 
                contentStyle={{ background: "#0f172a", borderRadius: "8px", border: "none", color: "#f8fafc", fontSize: "11px" }}
              />
              <Area type="monotone" dataKey="risk" stroke="#f43f5e" fill="rgba(244, 63, 94, 0.1)" strokeWidth={2} name="Risk Factor" />
              <Area type="monotone" dataKey="compliance" stroke="#6366f1" fill="rgba(99, 102, 241, 0.05)" strokeWidth={1.5} name="Governance Sync" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Repositories Health Feed */}
      <div className="space-y-3" id="repository-health-list">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Monitored Repositories</h3>
          <span className="text-xs text-indigo-600 font-semibold flex items-center space-x-1">
            <GitBranch className="h-3 w-3" />
            <span>4 Active Services</span>
          </span>
        </div>

        <div className="space-y-3">
          {metrics.repositoryMetrics.map((repo) => (
            <div 
              key={repo.id} 
              className="bg-white rounded-xl p-4 border border-slate-100 shadow-2xs hover:border-slate-200 transition-all"
              id={`repo-${repo.id}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 font-sans tracking-tight">
                    {repo.name}
                  </h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-[10px] text-slate-500 font-mono">{repo.language}</span>
                    <span className="text-[10px] text-slate-300">•</span>
                    <span className="text-[10px] text-slate-500 font-mono">Debt: {repo.dept} hrs</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md border ${getSecurityGradeColor(repo.securityScore)}`}>
                    SEC: {repo.securityScore}
                  </span>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-900 block">
                      {repo.health}%
                    </span>
                    <span className="text-[9px] text-slate-400 block uppercase tracking-wider font-semibold">Health</span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    repo.health > 90 
                      ? "bg-emerald-500" 
                      : repo.health > 80 
                        ? "bg-indigo-500" 
                        : "bg-amber-500"
                  }`}
                  style={{ width: `${repo.health}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
