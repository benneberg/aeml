import React, { useState } from "react";
import { 
  Shield, 
  Key, 
  Check, 
  X, 
  User, 
  Lock, 
  Unlock, 
  Sparkles,
  GitBranch,
  CheckCircle2,
  ExternalLink,
  LogOut
} from "lucide-react";
import { UserProfile } from "../types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLogin: (credentials: { role?: string; provider?: string; token?: string; username?: string }) => Promise<void>;
  onLogout: () => Promise<void>;
  darkMode?: boolean;
}

export default function AuthModal({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
  darkMode = false
}: AuthModalProps) {
  const [selectedRole, setSelectedRole] = useState<string>(currentUser?.role || "VP_ENGINEERING");
  const [selectedProvider, setSelectedProvider] = useState<"github" | "gitlab" | "enterprise_sso">("github");
  const [tokenInput, setTokenInput] = useState("");
  const [usernameInput, setUsernameInput] = useState(currentUser?.username || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authSuccessNotice, setAuthSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const roles = [
    {
      id: "VP_ENGINEERING",
      title: "VP of Engineering & Architecture",
      badge: "EXECUTIVE",
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
      description: "Full override authority, dynamic policy weighting, governance gates configuration & executive audits.",
      permissions: ["Override Governance Block", "Tune Risk Weights", "Synthesize Multi-Role PR Decisions", "Export Audit Ledger"]
    },
    {
      id: "SECURITY_LEAD",
      title: "Head of Security Architecture",
      badge: "SECURITY",
      color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
      description: "Cryptographic policy enforcement, CVE/AST review approval, bypass blocker verification.",
      permissions: ["Block Unsafe PRs", "Tune Security Multipliers", "Query Post-Mortem Outages", "Inspect Token Signatures"]
    },
    {
      id: "STAFF_ARCHITECT",
      title: "Staff Distributed Systems Architect",
      badge: "PLATFORM",
      color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
      description: "ADR compliance validation, infrastructure blast radius estimation & service dependency mapping.",
      permissions: ["Review Architecture Alignment", "Query Active ADRs", "Sandbox AST Diff Scanner", "Trigger CI/CD Runs"]
    },
    {
      id: "SENIOR_DEV",
      title: "Senior Software Engineer",
      badge: "CONTRIBUTOR",
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      description: "Standard developer access for submitting PRs, scanning custom patches, and inspecting review verdicts.",
      permissions: ["Submit PR Reviews", "Inspect AST Analysis", "Run Pre-Commit Linter", "View Service Registry"]
    }
  ];

  const handleRoleSelect = async (roleId: string) => {
    setSelectedRole(roleId);
    setIsSubmitting(true);
    try {
      await onLogin({ role: roleId, provider: selectedProvider, username: usernameInput });
      setAuthSuccessNotice(`Switched to ${roleId} role profile.`);
      setTimeout(() => setAuthSuccessNotice(null), 3000);
    } catch (err: any) {
      console.error("Failed to switch role:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConnectToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onLogin({ 
        role: selectedRole, 
        provider: selectedProvider, 
        token: tokenInput || "ghp_mock_live_oauth_token",
        username: usernameInput || (selectedProvider === "github" ? "octocat.lead" : "gitlab.dev")
      });
      setAuthSuccessNotice(`Connected via ${selectedProvider.toUpperCase()} OAuth token.`);
      setTimeout(() => setAuthSuccessNotice(null), 3000);
    } catch (err: any) {
      console.error("Failed to authenticate token:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className={`w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] ${
        darkMode ? "bg-slate-900 border border-slate-800 text-slate-100" : "bg-white text-slate-850"
      }`}>
        
        {/* Modal Header */}
        <div className={`p-4 flex items-center justify-between border-b ${
          darkMode ? "bg-slate-950 border-slate-800" : "bg-slate-900 text-white"
        }`}>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Team Identity & Access Control</h3>
              <p className="text-[10px] text-slate-400 font-mono">AEML Role-Based Governance Access (RBAC)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          
          {authSuccessNotice && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl p-2.5 text-xs font-semibold flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{authSuccessNotice}</span>
            </div>
          )}

          {/* Active Profile Info Banner */}
          {currentUser && (
            <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
              darkMode ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200/80"
            }`}>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-indigo-500 shrink-0">
                  <img src={currentUser.avatarUrl} alt={currentUser.name} className="h-full w-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold font-sans">{currentUser.name}</span>
                    <span className="text-[9px] font-mono text-slate-400">(@{currentUser.username})</span>
                  </div>
                  <span className="text-[10px] text-indigo-500 font-semibold block">{currentUser.roleTitle}</span>
                  <span className="text-[9px] text-slate-400 font-mono">{currentUser.organization}</span>
                </div>
              </div>

              <button
                onClick={onLogout}
                title="Reset session"
                className={`p-2 rounded-lg border text-xs font-mono flex items-center space-x-1 cursor-pointer transition-all ${
                  darkMode ? "bg-slate-900 border-slate-800 text-slate-400 hover:text-rose-400" : "bg-white border-slate-200 text-slate-600 hover:text-rose-600"
                }`}
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="text-[10px]">Reset</span>
              </button>
            </div>
          )}

          {/* OAuth Provider & Token Hook */}
          <div className={`p-3.5 rounded-xl border space-y-3 ${
            darkMode ? "bg-slate-950/40 border-slate-800" : "bg-white border-slate-200/80 shadow-3xs"
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5">
                <Key className="h-3.5 w-3.5 text-indigo-500" />
                <span>OAuth 2.0 / VCS Token Sync</span>
              </span>
              <span className="text-[9px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
                READY
              </span>
            </div>

            {/* Provider selector */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "github", label: "GitHub Enterprise" },
                { id: "gitlab", label: "GitLab SaaS" },
                { id: "enterprise_sso", label: "Okta / SSO" }
              ].map((prov) => (
                <button
                  key={prov.id}
                  type="button"
                  onClick={() => setSelectedProvider(prov.id as any)}
                  className={`text-[10px] font-semibold py-1.5 px-2 rounded-lg border text-center transition-all ${
                    selectedProvider === prov.id
                      ? (darkMode ? "bg-indigo-950 border-indigo-500 text-indigo-300" : "bg-indigo-50 border-indigo-500 text-indigo-700 font-bold")
                      : (darkMode ? "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700" : "bg-slate-50 border-slate-200 text-slate-600")
                  }`}
                >
                  {prov.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleConnectToken} className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
                    VCS Handle / Username
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. sophia.dev"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className={`w-full text-xs p-1.5 border rounded-lg focus:outline-none focus:border-indigo-500 font-mono ${
                      darkMode ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-850"
                    }`}
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
                    Personal Access Token (PAT)
                  </label>
                  <input
                    type="password"
                    placeholder="ghp_****************"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    className={`w-full text-xs p-1.5 border rounded-lg focus:outline-none focus:border-indigo-500 font-mono ${
                      darkMode ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-850"
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 rounded-xl transition-all shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <Key className="h-3.5 w-3.5" />
                <span>{isSubmitting ? "Authenticating..." : `Authenticate with ${selectedProvider.toUpperCase()}`}</span>
              </button>
            </form>
          </div>

          {/* Persona / Role Selection Cards */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Simulate Team Role Access
            </span>

            <div className="space-y-2">
              {roles.map((r) => {
                const isCurrent = currentUser?.role === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => handleRoleSelect(r.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isCurrent
                        ? (darkMode ? "bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500" : "bg-indigo-50/50 border-indigo-400 ring-1 ring-indigo-400")
                        : (darkMode ? "bg-slate-950/40 border-slate-800 hover:border-slate-700" : "bg-white border-slate-200 hover:border-slate-300 shadow-3xs")
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold font-sans">{r.title}</span>
                        <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border ${r.color}`}>
                          {r.badge}
                        </span>
                      </div>
                      {isCurrent && (
                        <span className="flex items-center space-x-1 text-emerald-500 text-[10px] font-bold font-mono">
                          <Check className="h-3 w-3" />
                          <span>ACTIVE</span>
                        </span>
                      )}
                    </div>
                    <p className={`text-[10px] leading-relaxed mb-2 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                      {r.description}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {r.permissions.map((perm, idx) => (
                        <span
                          key={idx}
                          className={`text-[8px] font-mono px-1.5 py-0.5 rounded ${
                            darkMode ? "bg-slate-900 text-slate-400 border border-slate-800" : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          ✓ {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className={`p-3 border-t flex justify-end ${
          darkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
        }`}>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-1.5 px-4 rounded-xl transition-all cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
