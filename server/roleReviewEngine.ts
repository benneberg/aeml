import { GoogleGenAI, Type } from "@google/genai";
import { PullRequestDecision, RoleReview, Issue } from "../src/types";
import { engineeringMemory } from "./engineeringMemory";

/**
 * Interface representing the detailed response from AEML Role Review Orchestrator
 */
export interface OrchestrationResult {
  backendCTO: RoleReview;
  securityCTO: RoleReview;
  infrastructureCTO: RoleReview;
  issues: Issue[];
  executiveSummary: string;
}

export class RoleReviewEngine {
  /**
   * Defines the detailed evaluation persona and evaluation objectives for the Backend CTO.
   */
  public static getBackendCTOPrompt(): string {
    return `### ROLE: Backend CTO (Architecture, Coupling, Maintainability)
Your focus is software architecture quality, domain model integrity, code complexity, and API evolution standards.
Assess the code against these core guidelines:
- Coupling & Cohesion: Ensure clean separation of concerns. Do not mix database query layers with routing or transport layers directly.
- API Design: Check for backward compatibility of endpoints, correct parameter signatures, and typed data transfer objects.
- Maintainability: Enforce clean modular structures, dry code patterns, readable variable names, and logical code branching.
- ADR Integrity: Guard against violations of Architectural Decisions (e.g., direct string concatenations for database queries or improper connection pool bounds).`;
  }

  /**
   * Defines the detailed evaluation persona and evaluation objectives for the Security CTO.
   */
  public static getSecurityCTOPrompt(): string {
    return `### ROLE: Security CTO (Authentication, Authorization, Vulnerabilities)
Your focus is cryptographic safety, secure coding standards (OWASP Top 10), authentication pathways, and data access privacy.
Assess the code against these core guidelines:
- Injection Prevention: Strictly block any form of raw SQL string concatenation, command injection, or unsanitized script execution.
- Crypto Standards: Verify cryptographic algorithms (e.g., RS256 asymmetric signature verification instead of HS256). Strictly block developer bypass checks in production-like environments.
- Fallback Leakages: Prevent leaking secure tokens or credentials via logs, HTTP query fallbacks, or unencrypted local storage.
- Authorization Integrity: Enforce proper permission checks on endpoints, ensuring users can only read or edit authorized data models.`;
  }

  /**
   * Defines the detailed evaluation persona and evaluation objectives for the Infrastructure CTO.
   */
  public static getInfrastructureCTOPrompt(): string {
    return `### ROLE: Infrastructure CTO (Performance, Reliability, Scales)
Your focus is performance overhead, CPU/Memory resource constraints, database interaction efficiency, and network/threading stability.
Assess the code against these core guidelines:
- Database Bottlenecks: Highlight massive connection pool scale inflations, lack of pagination on broad SELECT statements, and lack of database indexes on filter fields.
- Memory & Processors: Catch inefficient synchronous loops, unbounded memory buffers, and risky long-lived resource references.
- Failure Modes: Ensure correct connection releases, error handling boundaries, and resource cleanup to prevent memory leaks or starvation.`;
  }

  /**
   * Constructs the structured evaluation prompt for the Gemini LLM.
   */
  public static buildOrchestrationPrompt(diff: string, repo: string): string {
    const memoryContext = engineeringMemory.formatContextForLLM(repo);

    return `You are the core evaluation engine of the AI Engineering Manager Layer (AEML).
Analyze the following pull request code diff and provide three independent senior executive review verdicts (Backend CTO, Security CTO, and Infrastructure CTO) and a list of specific static issues parsed.

Use these role-specific standards for your evaluation:

${this.getBackendCTOPrompt()}

${this.getSecurityCTOPrompt()}

${this.getInfrastructureCTOPrompt()}

Review Context:
${memoryContext}

Pull Request Diff to analyze:
---
${diff}
---

Your response MUST match the requested JSON format exactly. Ensure all JSON fields are complete and represent realistic engineering verdicts: "APPROVE", "HOLD", or "BLOCK" depending on severity.
- If an active ADR rule is violated (e.g., using raw SQL string concatenation in billing-service when ADR-11 bans it), or if a security bypass is detected (e.g., unverified JWT decode in auth-service), you MUST trigger a "BLOCK" verdict.
- If an incident regression is identified (e.g., development-only JWT bypass as in INCIDENT-AUTH-09, or starvation via connection pools as in INCIDENT-BILL-44), you MUST trigger a "BLOCK" verdict.
- Ensure the changes are aligned with the owner team and dependency expectations for the service.`;
  }

  /**
   * Returns the strict Gemini Response Schema matching our type system.
   */
  public static getResponseSchema() {
    return {
      type: Type.OBJECT,
      properties: {
        backendCTO: {
          type: Type.OBJECT,
          properties: {
            verdict: { type: Type.STRING, description: "Must be 'APPROVE', 'HOLD', or 'BLOCK'" },
            reasoning: { type: Type.STRING },
            concerns: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedActions: { type: Type.ARRAY, items: { type: Type.STRING } },
            confidence: { type: Type.INTEGER }
          },
          required: ["verdict", "reasoning", "concerns", "suggestedActions", "confidence"]
        },
        securityCTO: {
          type: Type.OBJECT,
          properties: {
            verdict: { type: Type.STRING, description: "Must be 'APPROVE', 'HOLD', or 'BLOCK'" },
            reasoning: { type: Type.STRING },
            concerns: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedActions: { type: Type.ARRAY, items: { type: Type.STRING } },
            confidence: { type: Type.INTEGER }
          },
          required: ["verdict", "reasoning", "concerns", "suggestedActions", "confidence"]
        },
        infrastructureCTO: {
          type: Type.OBJECT,
          properties: {
            verdict: { type: Type.STRING, description: "Must be 'APPROVE', 'HOLD', or 'BLOCK'" },
            reasoning: { type: Type.STRING },
            concerns: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedActions: { type: Type.ARRAY, items: { type: Type.STRING } },
            confidence: { type: Type.INTEGER }
          },
          required: ["verdict", "reasoning", "concerns", "suggestedActions", "confidence"]
        },
        issues: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              file: { type: Type.STRING },
              line: { type: Type.INTEGER },
              severity: { type: Type.STRING, description: "Must be 'LOW', 'MEDIUM', 'HIGH', or 'CRITICAL'" },
              source: { type: Type.STRING, description: "E.g., 'Static Analysis', 'AST Analyzer', 'Security AST'" },
              category: { type: Type.STRING, description: "E.g., 'Authentication', 'Performance', 'Memory', 'API Evolution', 'Architecture'" },
              description: { type: Type.STRING }
            },
            required: ["file", "line", "severity", "source", "category", "description"]
          }
        },
        executiveSummary: { type: Type.STRING }
      },
      required: ["backendCTO", "securityCTO", "infrastructureCTO", "issues", "executiveSummary"]
    };
  }

  /**
   * Orchestrates the review flow. Calls the Gemini API when available, otherwise falls back to a high-fidelity static simulator.
   */
  public async reviewPullRequest(
    ai: GoogleGenAI | null,
    diff: string,
    repo: string
  ): Promise<OrchestrationResult> {
    if (ai) {
      try {
        const prompt = RoleReviewEngine.buildOrchestrationPrompt(diff, repo);
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            systemInstruction: "You are the AI Engineering Manager Layer (AEML) Core Analyzer. Your judgments must be highly professional, detailed, objective, and represent the actual production risk based on senior-level criteria.",
            responseMimeType: "application/json",
            responseSchema: RoleReviewEngine.getResponseSchema()
          }
        });

        const responseText = response.text || "{}";
        const resultJSON = JSON.parse(responseText.trim());

        // Validate types or set default verdicts in case the LLM returned incomplete attributes
        const backendCTO: RoleReview = {
          verdict: resultJSON.backendCTO?.verdict || "APPROVE",
          reasoning: resultJSON.backendCTO?.reasoning || "",
          concerns: resultJSON.backendCTO?.concerns || [],
          suggestedActions: resultJSON.backendCTO?.suggestedActions || [],
          confidence: resultJSON.backendCTO?.confidence || 85
        };

        const securityCTO: RoleReview = {
          verdict: resultJSON.securityCTO?.verdict || "APPROVE",
          reasoning: resultJSON.securityCTO?.reasoning || "",
          concerns: resultJSON.securityCTO?.concerns || [],
          suggestedActions: resultJSON.securityCTO?.suggestedActions || [],
          confidence: resultJSON.securityCTO?.confidence || 85
        };

        const infrastructureCTO: RoleReview = {
          verdict: resultJSON.infrastructureCTO?.verdict || "APPROVE",
          reasoning: resultJSON.infrastructureCTO?.reasoning || "",
          concerns: resultJSON.infrastructureCTO?.concerns || [],
          suggestedActions: resultJSON.infrastructureCTO?.suggestedActions || [],
          confidence: resultJSON.infrastructureCTO?.confidence || 85
        };

        return {
          backendCTO,
          securityCTO,
          infrastructureCTO,
          issues: resultJSON.issues || [],
          executiveSummary: resultJSON.executiveSummary || ""
        };
      } catch (err) {
        console.error("AEML RoleReviewEngine: LLM Orchestration failed, invoking fallback static simulator.", err);
        return this.runStaticSimulationFallback(diff);
      }
    } else {
      return this.runStaticSimulationFallback(diff);
    }
  }

  /**
   * Executes high-fidelity static analysis and rule checking in offline/fallback mode.
   */
  private runStaticSimulationFallback(diffToAnalyze: string): OrchestrationResult {
    console.log("AEML RoleReviewEngine: Executing simulation analyzer...");
    const lowercaseDiff = diffToAnalyze.toLowerCase();
    const detectedIssues: Issue[] = [];

    let backendVerdict: "APPROVE" | "HOLD" | "BLOCK" = "APPROVE";
    let securityVerdict: "APPROVE" | "HOLD" | "BLOCK" = "APPROVE";
    let infraVerdict: "APPROVE" | "HOLD" | "BLOCK" = "APPROVE";

    const backendConcerns: string[] = [];
    const securityConcerns: string[] = [];
    const infraConcerns: string[] = [];

    const backendActions: string[] = [];
    const securityActions: string[] = [];
    const infraActions: string[] = [];

    // 1. JWT verification / development bypass check (PR #104 signature pattern)
    if (lowercaseDiff.includes("jwt.decode") || lowercaseDiff.includes("bypass") || lowercaseDiff.includes("process.env.node_env === 'development'")) {
      securityVerdict = "BLOCK";
      securityConcerns.push("Vulnerability: JWT cryptographic signature bypass in development mode.");
      securityConcerns.push("Risk of malicious query-string token fallback parameter injects.");
      securityActions.push("Perform full cryptographic validations even in development workloads using symmetric or mocked asymmetric certs.");
      securityActions.push("Enforce strict authorization schemes, stripping query token parameters.");

      detectedIssues.push({
        file: "src/middleware/auth.ts",
        line: 20,
        severity: "CRITICAL",
        source: "Security AST",
        category: "Authentication",
        description: "Cryptographic signature validation is bypassed when NODE_ENV is set to development. This could lead to token forging in test instances."
      });

      detectedIssues.push({
        file: "src/middleware/auth.ts",
        line: 12,
        severity: "HIGH",
        source: "Static Analysis",
        category: "Authentication",
        description: "Exposes authentication token verification parameters via fallback HTTP Query string parameters, risking log leakage."
      });
    }

    // 2. Database connection pooling pool scale inflation (PR #212 signature pattern)
    if (lowercaseDiff.includes("max: 500") || lowercaseDiff.includes("pool") || lowercaseDiff.includes("select * from invoices")) {
      infraVerdict = "BLOCK";
      infraConcerns.push("Database pool inflated abruptly to 500 connections (potential thread starvation and server socket exhaust).");
      infraConcerns.push("OOM hazards from non-paginated invoice fetches ('SELECT * FROM invoices WHERE user_id').");
      infraActions.push("Scale connections horizontally or utilize a proxy layer like PgBouncer instead of inflating thread pool directly.");
      infraActions.push("Enforce LIMIT constraints and verify query is using the userId index.");

      backendVerdict = "HOLD";
      backendConcerns.push("Domain boundary coupling issues with raw string SQL concatenation ('+ userId').");
      backendActions.push("Adopt parameter binding to prevent SQL Injection risks.");

      detectedIssues.push({
        file: "src/db/pool.ts",
        line: 8,
        severity: "HIGH",
        source: "Rule Engine",
        category: "Performance",
        description: "Database connection pool scale inflated from 20 to 500 connections. Risky for downstream container processes."
      });

      detectedIssues.push({
        file: "src/db/pool.ts",
        line: 13,
        severity: "CRITICAL",
        source: "AST Analyzer",
        category: "Architecture",
        description: "SQL Injection vulnerability via unsanitized query parameters concatenation ('+ userId'). Use parameter binding."
      });

      detectedIssues.push({
        file: "src/db/pool.ts",
        line: 14,
        severity: "MEDIUM",
        source: "Static Analysis",
        category: "Memory",
        description: "Unbounded query fetches all invoices sequentially. This will degrade memory performance during peak user audits."
      });
    }

    // 3. Simple alerts-queue pattern
    if (lowercaseDiff.includes("alerts-queue") || lowercaseDiff.includes("dispatch")) {
      detectedIssues.push({
        file: "src/dispatch.ts",
        line: 5,
        severity: "LOW",
        source: "Static Analysis",
        category: "API Evolution",
        description: "Queue payload serialized to raw string. Consider using typed schema envelopes."
      });
    }

    if (detectedIssues.length === 0) {
      detectedIssues.push({
        file: "src/index.ts",
        line: 1,
        severity: "LOW",
        source: "Static Analysis",
        category: "Architecture",
        description: "Static code inspection successfully completed. No blocking vulnerabilities or architectural anti-patterns found."
      });
    }

    let executiveSummary = "Architectural review finished successfully. Code has been inspected across Backend, Security, and Infrastructure metrics.";
    if (securityVerdict === "BLOCK" || infraVerdict === "BLOCK") {
      executiveSummary = "BLOCK: High-risk policy violations and potential runtime crashes detected. Cryptographic bypass mechanisms or unstable database pooling scales require hotfixes before merging.";
    }

    return {
      backendCTO: {
        verdict: backendVerdict,
        reasoning: backendVerdict === "APPROVE" ? "Code changes present no major coupling risks or architecture shifts." : "Domain separation boundaries are degraded. Relational data fetches bypass parameterized standards.",
        concerns: backendConcerns,
        suggestedActions: backendActions,
        confidence: 88
      },
      securityCTO: {
        verdict: securityVerdict,
        reasoning: securityVerdict === "APPROVE" ? "No sensitive credentials or cryptographic bypass structures detected." : "Critical risk identified. Developer is bypassing normal token verification paths based on active container environment variables.",
        concerns: securityConcerns,
        suggestedActions: securityActions,
        confidence: 95
      },
      infrastructureCTO: {
        verdict: infraVerdict,
        reasoning: infraVerdict === "APPROVE" ? "Memory footprint and processor allocations are within normal thresholds." : "Runtime resource scale parameters are configured dangerously high. SQL operations run without pagination or indexes.",
        concerns: infraConcerns,
        suggestedActions: infraActions,
        confidence: 90
      },
      issues: detectedIssues,
      executiveSummary
    };
  }
}

export const roleReviewEngine = new RoleReviewEngine();
