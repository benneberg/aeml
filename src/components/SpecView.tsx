import React from "react";
import { 
  FileText, 
  Settings, 
  Map, 
  Code, 
  Compass, 
  HelpCircle, 
  ArrowRight,
  GitMerge,
  Cpu,
  ShieldAlert,
  Terminal,
  Activity,
  Database,
  Search
} from "lucide-react";

export default function SpecView() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedFilter, setSelectedFilter] = React.useState<"all" | "adr" | "incident" | "ownership">("all");
  const [results, setResults] = React.useState<{ matchedPRs: any[]; matchedIncidents: any[]; matchedAdrs: any[] }>({
    matchedPRs: [],
    matchedIncidents: [],
    matchedAdrs: []
  });
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchMemory = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/memory/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error("Failed to query memory: ", err);
      } finally {
        setLoading(false);
      }
    };

    // Simple debounce
    const delayDebounce = setTimeout(() => {
      fetchMemory();
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  return (
    <div className="space-y-6" id="spec-reference-container">
      {/* Spec Hero Banner */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-5 relative overflow-hidden shadow-md" id="spec-hero">
        <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="flex items-center space-x-2 text-indigo-400 mb-1">
          <Compass className="h-4 w-4" />
          <span className="text-xs font-bold font-mono tracking-wider uppercase">Open Specification Reference</span>
        </div>
        <h3 className="text-xl font-bold tracking-tight mb-1">AEML Design & Governance Framework</h3>
        <p className="text-xs text-slate-300">
          Moving AI from simple code generation toward structural engineering governance and leadership.
        </p>
      </div>

      {/* Engineering Memory Module Section */}
      <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-3xs space-y-4" id="engineering-memory-section">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center space-x-1.5 font-sans">
            <Database className="h-4 w-4 text-emerald-500" />
            <span>AEML Continuous Engineering Memory</span>
          </h4>
          <span className="bg-emerald-100 text-emerald-800 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse">
            CONNECTED
          </span>
        </div>

        <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
          This module queries past incidents, architectural decisions (ADRs), and team ownership metadata dynamically, feeding them to the multi-role reviewer council to warn against regressions.
        </p>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search memory... (e.g., 'bypass', 'pool', 'RS256')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 transition-all font-sans"
          />
        </div>

        {/* Categories Tab selector */}
        <div className="flex space-x-1">
          {[
            { id: "all", label: "Show All" },
            { id: "adr", label: "ADRs" },
            { id: "incident", label: "Incidents" },
            { id: "ownership", label: "Owners" }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedFilter(cat.id as any)}
              className={`px-2.5 py-1 text-[10px] rounded-lg font-mono font-medium transition-all cursor-pointer capitalize ${
                selectedFilter === cat.id
                  ? "bg-slate-950 text-white shadow-3xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Memory Grid/List Results */}
        {loading ? (
          <div className="text-center py-6 text-slate-400 text-xs font-mono">
            Searching memory registries...
          </div>
        ) : (
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1" id="memory-search-results">
            
            {/* 1. Service Ownerships */}
            {(selectedFilter === "all" || selectedFilter === "ownership") && searchQuery === "" && (
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Service Ownership & Complexity Profiles</span>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { repo: "auth-service", team: "Security & Identity Core", crit: "CRITICAL", deps: "redis-cluster, user-db-cluster" },
                    { repo: "billing-service", team: "Fintech Platform Engineering", crit: "CRITICAL", deps: "auth-service, postgresql-master, stripe-external-api" },
                    { repo: "gateway-router", team: "Core Traffic & Platform", crit: "HIGH", deps: "auth-service" },
                    { repo: "notification-hub", team: "Unified Communications Team", crit: "MEDIUM", deps: "rabbitmq-cluster, sendgrid-external-api" }
                  ].map((s) => (
                    <div key={s.repo} className="p-3 border border-slate-100 bg-slate-50/50 rounded-lg flex flex-col space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-900">{s.repo}</span>
                        <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          s.crit === "CRITICAL" ? "bg-rose-100 text-rose-800" : s.crit === "HIGH" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                        }`}>{s.crit} Priority</span>
                      </div>
                      <span className="text-[10px] text-slate-600 font-sans"><strong className="text-slate-800">Team</strong>: {s.team}</span>
                      <span className="text-[9px] text-slate-400 font-mono"><strong className="text-slate-500">Dependencies</strong>: {s.deps}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Architectural Decisions */}
            {(selectedFilter === "all" || selectedFilter === "adr") && results.matchedAdrs?.length > 0 && (
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Architectural Decisions (ADR Rules)</span>
                {results.matchedAdrs.map((adr: any) => (
                  <div key={adr.id} className="p-3 border border-indigo-100 bg-indigo-50/30 rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="bg-indigo-100 text-indigo-800 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded">
                        {adr.id}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">{adr.repo}</span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-900 font-sans">{adr.title}</h5>
                    <p className="text-[10px] text-slate-700 leading-normal">{adr.decision}</p>
                    <p className="text-[9px] text-slate-400 italic">Rationale: {adr.rationale}</p>
                  </div>
                ))}
              </div>
            )}

            {/* 3. Incidents */}
            {(selectedFilter === "all" || selectedFilter === "incident") && results.matchedIncidents?.length > 0 && (
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Post-Mortem Incident Log</span>
                {results.matchedIncidents.map((inc: any) => (
                  <div key={inc.id} className="p-3 border border-rose-100 bg-rose-50/30 rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="bg-rose-100 text-rose-800 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded">
                        {inc.id}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">{inc.repo}</span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-900 font-sans">{inc.title}</h5>
                    <p className="text-[10px] text-rose-700 font-sans leading-normal">Outage: {inc.description}</p>
                    <p className="text-[9px] text-slate-500 bg-white/70 border border-slate-100 p-1 rounded font-mono">
                      Fix Action: {inc.resolution}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* 4. Past decisions matching search */}
            {searchQuery !== "" && results.matchedPRs?.length > 0 && (
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Precedent Pull Request Reviews</span>
                {results.matchedPRs.map((pr: any) => (
                  <div key={pr.id} className="p-3 border border-slate-100 bg-slate-50 rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        pr.verdict === "APPROVE" ? "bg-emerald-100 text-emerald-800" : pr.verdict === "HOLD" ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"
                      }`}>{pr.verdict}</span>
                      <span className="text-[9px] text-slate-400 font-mono">{pr.repo}</span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-900 font-sans">{pr.title}</h5>
                    <p className="text-[10px] text-slate-500 leading-normal">{pr.executiveSummary}</p>
                  </div>
                ))}
              </div>
            )}

            {/* No matches */}
            {((selectedFilter === "adr" && results.matchedAdrs?.length === 0) ||
              (selectedFilter === "incident" && results.matchedIncidents?.length === 0) ||
              (selectedFilter === "all" && searchQuery !== "" && results.matchedAdrs?.length === 0 && results.matchedIncidents?.length === 0 && results.matchedPRs?.length === 0)) && (
              <div className="text-center py-6 text-slate-400 text-xs font-sans">
                No matching memory logs found in the governance index.
              </div>
            )}

          </div>
        )}
      </div>

      {/* Target Users Persona Board */}
      <div className="space-y-3" id="spec-personas">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">
          Target Personas & Stakeholders
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 border border-slate-100 rounded-xl space-y-1 shadow-3xs">
            <span className="text-xs font-bold text-slate-900 block font-sans">Developers</span>
            <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
              Local PR reviews, security check bypass guidance, and explainable AST risk parameters.
            </p>
          </div>

          <div className="bg-white p-4 border border-slate-100 rounded-xl space-y-1 shadow-3xs">
            <span className="text-xs font-bold text-slate-900 block font-sans">Tech Leads</span>
            <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
              Team quality dashboard, architectural consistency, and technical debt visibility gates.
            </p>
          </div>

          <div className="bg-white p-4 border border-slate-100 rounded-xl space-y-1 shadow-3xs">
            <span className="text-xs font-bold text-slate-900 block font-sans">Engineering Managers</span>
            <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
              Repository health index, release risk metrics, team compliance, and review cycles.
            </p>
          </div>

          <div className="bg-white p-4 border border-slate-100 rounded-xl space-y-1 shadow-3xs">
            <span className="text-xs font-bold text-slate-900 block font-sans">CTOs & VPs</span>
            <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
              Organizational engineering velocity, compliance audit logs, and operational risk.
            </p>
          </div>
        </div>
      </div>

      {/* Decision Synthesis Flow Visualizer */}
      <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-3xs space-y-3" id="spec-synthesis-flow">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center space-x-1.5">
          <GitMerge className="h-4 w-4 text-indigo-500" />
          <span>Synthesis Decision Hierarchy</span>
        </h4>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Aggregates verdicts across Backend, Security, and Infrastructure CTO reviewers deterministically:
        </p>

        <div className="space-y-2 pt-1 font-mono text-[10px]" id="synthesis-priority-tree">
          <div className="bg-rose-50 border border-rose-100 rounded-lg p-2 flex items-center justify-between">
            <span className="font-semibold text-rose-800">1. ANY Role = BLOCK</span>
            <ArrowRight className="h-3 w-3 text-rose-400" />
            <span className="bg-rose-500 text-white font-bold px-2 py-0.5 rounded uppercase">BLOCK</span>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-lg p-2 flex items-center justify-between">
            <span className="font-semibold text-amber-800">2. ANY Role = HOLD (No Block)</span>
            <ArrowRight className="h-3 w-3 text-amber-400" />
            <span className="bg-amber-500 text-white font-bold px-2 py-0.5 rounded uppercase">HOLD</span>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2 flex items-center justify-between">
            <span className="font-semibold text-emerald-800">3. ALL Roles = APPROVE</span>
            <ArrowRight className="h-3 w-3 text-emerald-400" />
            <span className="bg-emerald-500 text-white font-bold px-2 py-0.5 rounded uppercase">APPROVE</span>
          </div>
        </div>
      </div>

      {/* Interactive Roadmap Roadmap */}
      <div className="space-y-3" id="spec-roadmap">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">
          AEML Roadmap Timeline
        </h4>

        <div className="space-y-4 pl-2 border-l-2 border-slate-200" id="spec-timeline">
          
          <div className="relative pl-4" id="roadmap-p1">
            <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-emerald-500 border-2 border-white ring-4 ring-emerald-100"></span>
            <span className="text-[10px] text-emerald-600 font-mono font-bold uppercase tracking-wider block">Phase 1 - Core Engine (Completed)</span>
            <h5 className="text-xs font-bold text-slate-900 mt-0.5">AST Rules, Diff Analyzer & Multi-Role Simulation</h5>
            <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
              TypeScript AST checks, server-side Gemini 3.5 mock pipeline integration, and risk-score normalization logic.
            </p>
          </div>

          <div className="relative pl-4" id="roadmap-p2">
            <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-emerald-500 border-2 border-white ring-4 ring-emerald-100"></span>
            <span className="text-[10px] text-emerald-600 font-mono font-bold uppercase tracking-wider block">Phase 2 - Mobile-first UX (Completed)</span>
            <h5 className="text-xs font-bold text-slate-900 mt-0.5">Actionable Governance Dashboard & Alerts</h5>
            <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
              Visualizing tech debt, repository compliance scoreboards, diff comparisons, and timeline audit logs.
            </p>
          </div>

          <div className="relative pl-4" id="roadmap-p3">
            <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-indigo-500 border-2 border-white ring-4 ring-indigo-100 animate-pulse"></span>
            <span className="text-[10px] text-indigo-600 font-mono font-bold uppercase tracking-wider block">Phase 3 - Continuous Memory (Active)</span>
            <h5 className="text-xs font-bold text-slate-900 mt-0.5">Incident Regressions & ADR Policy Verification</h5>
            <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
              Linking previous outage history, active Architectural Decisions (ADRs), and owner team configurations directly into Gemini to automate deep compliance verification.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
