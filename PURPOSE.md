# Purpose & Scope

AEML (AI Engineering Manager Layer) shifts the role of artificial intelligence from standard code autocompletion and snippet generation toward strict, proactive engineering governance.

---

## Problem Statement
Traditional static analysis tools can detect syntax issues or basic security bugs, but they lack:
1. **Contextual Organizational Memory**: Awareness of past production incidents (e.g., auth bypasses) or architectural guidelines (e.g., ADRs).
2. **Simulated Human Judgment**: Understanding code changes from the perspective of specialized tech leads (e.g., Security, Architecture, Infrastructure) before a human manager has to intervene.
3. **Actionable Executive Syntheses**: Aggregating raw code warnings into definitive decisions (APPROVE, HOLD, BLOCK) linked with business-level risk calculations.

---

## Target Audience
- **Developers**: Real-time feedback regarding security vulnerabilities or domain-boundary coupling violations before code merges. (Confidence: High)
- **Tech Leads & Architects**: Oversight of repository-wide compliance trends and code alignment against pre-written ADR rules. (Confidence: High)
- **CTOs & VP of Engineering**: High-level risk score analytics and macro engineering quality trends. (Confidence: Medium)

---

## Value Proposition
- **Guaranteed Gatekeeping**: Eliminates human negligence by blocking risky PR merges using automated multi-persona consensus.
- **Context-Aware Audits**: Resolves regressions by matching incoming PR diffs against historic incident archives.
- **Sub-Second Offline Simulation**: Offers high-fidelity AST parsing and heuristic scoring if external API keys or cloud connections are missing.
