export interface Repository {
  id: string;
  name: string;
  health: number;
  securityScore: string;
  language: string;
  dept: number;
  activePRs: number;
}

export interface PullRequest {
  id: string;
  title: string;
  repo: string;
  author: string;
  createdAt: string;
  status: string;
  diff: string;
}

export interface Issue {
  file: string;
  line: number;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  source: string;
  category: string;
  description: string;
}

export interface RoleReview {
  verdict: "APPROVE" | "HOLD" | "BLOCK";
  reasoning: string;
  concerns: string[];
  suggestedActions: string[];
  confidence: number;
}

export interface PullRequestDecision {
  id: string;
  prId: string;
  title: string;
  repo: string;
  author: string;
  riskScore: number;
  verdict: "APPROVE" | "HOLD" | "BLOCK";
  timestamp: string;
  executiveSummary: string;
  backendCTO: RoleReview;
  securityCTO: RoleReview;
  infrastructureCTO: RoleReview;
  issues: Issue[];
}

export interface SystemAlert {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  repo: string;
}

export interface ExecutiveMetrics {
  engineeringHealthScore: number;
  totalTechnicalDebt: number;
  averageDeploymentsPerDay: number;
  incidentRateReduction: number;
  governanceComplianceRate: number;
  activePRsCount: number;
  repositoryMetrics: Repository[];
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl: string;
  role: "VP_ENGINEERING" | "SECURITY_LEAD" | "STAFF_ARCHITECT" | "SENIOR_DEV";
  roleTitle: string;
  provider: "github" | "gitlab" | "enterprise_sso";
  organization: string;
  permissions: string[];
}

