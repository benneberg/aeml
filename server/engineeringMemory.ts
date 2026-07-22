import { PullRequestDecision, RoleReview, Issue } from "../src/types";
import { persistenceAdapter } from "./persistenceAdapter";

export interface ServiceOwnership {
  repo: string;
  teamOwner: string;
  criticality: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  dependencies: string[];
}

export interface ArchitecturalDecision {
  id: string;
  repo: string;
  title: string;
  description: string;
  decision: string;
  rationale: string;
  timestamp: string;
}

export interface IncidentHistory {
  id: string;
  repo: string;
  title: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description: string;
  resolution: string;
  timestamp: string;
}

export interface MemoryQueryContext {
  ownership?: ServiceOwnership;
  incidents: IncidentHistory[];
  adrList: ArchitecturalDecision[];
  pastPRs: PullRequestDecision[];
}

class EngineeringMemory {
  private serviceOwnerships: Map<string, ServiceOwnership> = new Map();
  private architecturalDecisions: ArchitecturalDecision[] = [];
  private incidentHistories: IncidentHistory[] = [];
  private pastPRs: PullRequestDecision[] = [];

  constructor() {
    this.seedInitialData();
    const stored = persistenceAdapter.load();
    if (stored && Array.isArray(stored.pastPRs) && stored.pastPRs.length > 0) {
      this.pastPRs = stored.pastPRs;
    }
  }

  private seedInitialData() {
    // Seed Service Ownerships
    const ownerships: ServiceOwnership[] = [
      {
        repo: "auth-service",
        teamOwner: "Security & Identity Core",
        criticality: "CRITICAL",
        dependencies: ["redis-cluster", "user-db-cluster"]
      },
      {
        repo: "billing-service",
        teamOwner: "Fintech Platform Engineering",
        criticality: "CRITICAL",
        dependencies: ["auth-service", "postgresql-master", "stripe-external-api"]
      },
      {
        repo: "gateway-router",
        teamOwner: "Core Traffic & Platform",
        criticality: "HIGH",
        dependencies: ["auth-service"]
      },
      {
        repo: "notification-hub",
        teamOwner: "Unified Communications Team",
        criticality: "MEDIUM",
        dependencies: ["rabbitmq-cluster", "sendgrid-external-api"]
      }
    ];
    ownerships.forEach(o => this.serviceOwnerships.set(o.repo, o));

    // Seed Architectural Decisions (ADRs)
    this.architecturalDecisions = [
      {
        id: "ADR-04",
        repo: "auth-service",
        title: "Mandatory Asymmetric Token Signatures (RS256)",
        description: "Enforce asymmetric key-pair verification for high security trust distribution.",
        decision: "All OAuth2 JWT issuances and verifications must utilize RS256 algorithm. Symmetric HS256 token verification is deprecated.",
        rationale: "Ensures the private key only stays on the identity server, reducing attack surface across microservices.",
        timestamp: "2025-10-15T09:00:00Z"
      },
      {
        id: "ADR-11",
        repo: "billing-service",
        title: "Strict Use of Parameterized Prepared Queries",
        description: "Prevention of SQL Injections in fintech auditing pipelines.",
        decision: "Hand-crafted dynamic SQL string concatenations are strictly banned. All active database operations must use parameterized queries.",
        rationale: "Absolute compliance with PCI-DSS guidelines requires cryptographic and sanitization enforcement at compile-time.",
        timestamp: "2025-12-04T11:30:00Z"
      },
      {
        id: "ADR-25",
        repo: "billing-service",
        title: "Connection Pool Size Allocation Standards",
        description: "Optimal threading standards for connection pooling to prevent DB starvation.",
        decision: "Maximum database connections limit (max) must be capped between 20 to 50 on single containers. Large sudden pool inflations are forbidden.",
        rationale: "Horizontal autoscaling handles higher volume. Setting high max pool connection limits causes thread starvation on cloud-hosted DB master nodes.",
        timestamp: "2026-02-18T16:45:00Z"
      },
      {
        id: "ADR-01",
        repo: "gateway-router",
        title: "Container Sandboxing & Security Profile Boundaries",
        description: "Hardening production entryways.",
        decision: "Containers must run under standard non-privileged mode. Mounts on host control sockets (like docker.sock) are strictly forbidden.",
        rationale: "Mitigates container escape risk and host level hijacking via the API router endpoints.",
        timestamp: "2025-05-12T10:00:00Z"
      }
    ];

    // Seed Incident Histories
    this.incidentHistories = [
      {
        id: "INCIDENT-AUTH-09",
        repo: "auth-service",
        title: "Dev Token Bypass Leakage to Production",
        severity: "CRITICAL",
        description: "A fast development bypass check (allowing JWT unverified decode if development env check succeeded) was triggered in a staging environment where NODE_ENV was misconfigured, leaking sensitive endpoints access.",
        resolution: "Enforced mandatory mock asymmetric certificates even on local sandboxes. Disallowed development-only code branches in standard middleware.",
        timestamp: "2026-01-10T14:22:00Z"
      },
      {
        id: "INCIDENT-BILL-44",
        repo: "billing-service",
        title: "Database Starvation Crash under peak audit",
        severity: "HIGH",
        description: "Fintech audit script ran unbounded sequential fetches using dynamic non-parameterized queries with high connection pool settings, crashing the billing db master instance.",
        resolution: "Hard-capped local connection pools, mandated LIMIT constraints, and enforced automated parameter binding.",
        timestamp: "2026-03-02T19:05:00Z"
      }
    ];

    // Seed historical PR review decisions
    this.pastPRs = [
      {
        id: "rev-101",
        prId: "101",
        title: "Legacy Billing Gateway update",
        repo: "billing-service",
        author: "dan.architect",
        riskScore: 32,
        verdict: "APPROVE",
        timestamp: "2026-07-05T12:00:00Z",
        executiveSummary: "Architecturally clean. Low production risk. Fully compliant with PCI standards.",
        backendCTO: { verdict: "APPROVE", reasoning: "Clean separation of controller and logic.", concerns: [], suggestedActions: [], confidence: 95 },
        securityCTO: { verdict: "APPROVE", reasoning: "Sensitive fields encrypted appropriately.", concerns: [], suggestedActions: [], confidence: 90 },
        infrastructureCTO: { verdict: "APPROVE", reasoning: "Low performance penalty. Uses cached client.", concerns: [], suggestedActions: [], confidence: 85 },
        issues: [
          { file: "billing.ts", line: 42, severity: "LOW", source: "Static Analysis", category: "API Evolution", description: "Deprecated Stripe config argument." }
        ]
      },
      {
        id: "rev-102",
        prId: "102",
        title: "Docker container update",
        repo: "gateway-router",
        author: "sara.ops",
        riskScore: 75,
        verdict: "BLOCK",
        timestamp: "2026-07-06T09:40:00Z",
        executiveSummary: "High resource limits warning. Exposes internal Docker socket container ports directly.",
        backendCTO: { verdict: "APPROVE", reasoning: "No application changes.", concerns: [], suggestedActions: [], confidence: 90 },
        securityCTO: { verdict: "BLOCK", reasoning: "Container root socket access exposes host control path.", concerns: ["Docker root socket mounting", "Container security parameters missing"], suggestedActions: ["Avoid mounting docker.sock", "Run container as non-root user"], confidence: 98 },
        infrastructureCTO: { verdict: "HOLD", reasoning: "Memory limit configuration too low for standard runtime buffer.", concerns: ["OOM risk in Peak workloads"], suggestedActions: ["Set memory limit to at least 512MB"], confidence: 92 },
        issues: [
          { file: "Dockerfile", line: 12, severity: "CRITICAL", source: "Security AST", category: "Authentication", description: "Bypasses normal container permission isolation." },
          { file: "docker-compose.yml", line: 18, severity: "HIGH", source: "Rule Engine", category: "Memory", description: "Unbounded resource usage risk." }
        ]
      }
    ];
  }

  // Retrieve contextual engineering records based on target repo
  public getContext(repo: string): MemoryQueryContext {
    const ownership = this.serviceOwnerships.get(repo);
    const incidents = this.incidentHistories.filter(i => i.repo === repo);
    const adrList = this.architecturalDecisions.filter(a => a.repo === repo);
    const pastPRs = this.pastPRs.filter(p => p.repo === repo);

    return {
      ownership,
      incidents,
      adrList,
      pastPRs
    };
  }

  // Get ALL past PRs
  public getAllPastPRs(): PullRequestDecision[] {
    return this.pastPRs;
  }

  // Store newly processed PR details in Engineering Memory
  public recordPR(record: PullRequestDecision) {
    this.pastPRs.unshift(record);
    const current = persistenceAdapter.load() || {};
    persistenceAdapter.save({
      ...current,
      pastPRs: this.pastPRs
    });
  }

  // Store new incident details in Engineering Memory
  public recordIncident(incident: IncidentHistory) {
    this.incidentHistories.unshift(incident);
  }

  // Store new ADR in Engineering Memory
  public recordADR(adr: ArchitecturalDecision) {
    this.architecturalDecisions.unshift(adr);
  }

  // Search through all of engineering memory using query keyword
  public searchMemory(query: string): any {
    const q = query.toLowerCase();
    const matchedPRs = this.pastPRs.filter(p => p.title.toLowerCase().includes(q) || p.executiveSummary.toLowerCase().includes(q));
    const matchedIncidents = this.incidentHistories.filter(i => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
    const matchedAdrs = this.architecturalDecisions.filter(a => a.title.toLowerCase().includes(q) || a.decision.toLowerCase().includes(q));

    return {
      matchedPRs,
      matchedIncidents,
      matchedAdrs
    };
  }

  // Format contextual memory as a robust markdown text block for injection in Gemini LLM prompts
  public formatContextForLLM(repo: string): string {
    const ctx = this.getContext(repo);
    let output = `=== ENGINEERING GOVERNANCE MEMORY FOR REPOSITORY: [${repo}] ===\n\n`;

    // 1. Service Ownership & Complexity Metadata
    if (ctx.ownership) {
      output += `### Service Ownership & Criticality Profile:\n`;
      output += `- **Team Owner**: ${ctx.ownership.teamOwner}\n`;
      output += `- **Service Criticality Level**: ${ctx.ownership.criticality}\n`;
      output += `- **Downstream Dependencies**: ${ctx.ownership.dependencies.join(", ") || "None"}\n\n`;
    } else {
      output += `### Service Ownership: Unspecified. Treat as general standard microservice.\n\n`;
    }

    // 2. Architectural Decisions (ADR Alignment Rules)
    output += `### Active Architectural Decisions (ADR Rules):\n`;
    if (ctx.adrList.length === 0) {
      output += `* No specific ADR policies found for this repository. Use standard secure engineering guidelines.\n\n`;
    } else {
      ctx.adrList.forEach(adr => {
        output += `- **${adr.id}: ${adr.title}**\n`;
        output += `  * Decision: ${adr.decision}\n`;
        output += `  * Rationale: ${adr.rationale}\n`;
      });
      output += `\n`;
    }

    // 3. Historical Incident Registers (Regression Warnings)
    output += `### Historical Post-Mortem & Incident Reports (Vulnerability Regressions):\n`;
    if (ctx.incidents.length === 0) {
      output += `* No previous outages or security incidents recorded for this microservice. Ensure changes do not introduce new regressions.\n\n`;
    } else {
      ctx.incidents.forEach(inc => {
        output += `- **${inc.id}: ${inc.title}** (${inc.severity} Severity)\n`;
        output += `  * Description: ${inc.description}\n`;
        output += `  * Enforcement Action Taken: ${inc.resolution}\n`;
      });
      output += `\n`;
    }

    // 4. Past Pull Requests & Historical Decision Records
    output += `### Precedent Decisions Ledger (Past Pull Request Outcomes):\n`;
    if (ctx.pastPRs.length === 0) {
      output += `* No previous audit decisions registered in memory.\n\n`;
    } else {
      ctx.pastPRs.slice(0, 5).forEach(pr => {
        output += `- PR: "${pr.title}" (Verdict: **${pr.verdict}**, Risk: ${pr.riskScore}/100, Compiled: ${new Date(pr.timestamp).toLocaleDateString()})\n`;
        output += `  * Executive Verdict Summary: "${pr.executiveSummary}"\n`;
      });
      output += `\n`;
    }

    output += `=== END OF ENGINEERING GOVERNANCE MEMORY CONTEXT ===\n`;
    return output;
  }
}

export const engineeringMemory = new EngineeringMemory();
