import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { engineeringMemory } from "./server/engineeringMemory";

dotenv.config();

const app = express();
app.use(express.json());
const PORT = 3000;

// Initialize Gemini API client lazily and safely
const aiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (aiKey && aiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: aiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("AEML: Gemini API successfully initialized server-side.");
  } catch (err) {
    console.error("AEML: Failed to initialize Gemini API client:", err);
  }
} else {
  console.log("AEML: No GEMINI_API_KEY found, running in offline/high-fidelity simulation fallback mode.");
}

// In-Memory Database for AEML
const repositories = [
  { id: "auth-service", name: "auth-service", health: 94, securityScore: "A", language: "TypeScript", dept: 18, activePRs: 1 },
  { id: "billing-service", name: "billing-service", health: 88, securityScore: "B", language: "TypeScript", dept: 24, activePRs: 1 },
  { id: "gateway-router", name: "gateway-router", health: 76, securityScore: "C", language: "Go", dept: 42, activePRs: 0 },
  { id: "notification-hub", name: "notification-hub", health: 98, securityScore: "A", language: "Python", dept: 12, activePRs: 1 }
];

const mockPRs = [
  {
    id: "104",
    title: "OAuth2 Token Validation Middleware Refactoring",
    repo: "auth-service",
    author: "sophia.dev",
    createdAt: "2026-07-06T14:30:00Z",
    status: "UNDER_REVIEW",
    diff: `diff --git a/src/middleware/auth.ts b/src/middleware/auth.ts
index c6b9f2d..a82bc19 100644
--- a/src/middleware/auth.ts
+++ b/src/middleware/auth.ts
@@ -10,12 +10,18 @@ export async function validateToken(req: Request, res: Response, next: NextFunct
-    const authHeader = req.headers.authorization;
-    if (!authHeader || !authHeader.startsWith('Bearer ')) {
-        return res.status(401).json({ error: 'Missing token' });
-    }
-    const token = authHeader.split(' ')[1];
-    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['RS256'] });
-    req.user = decoded;
-    next();
+    // Optimized Token verification by introducing algorithm fallback
+    const authHeader = req.headers.authorization || req.query.token; // allow query token fallback
+    if (!authHeader) {
+        return res.status(401).json({ error: 'Missing token parameter' });
+    }
+    const token = authHeader.toString().startsWith('Bearer ') 
+        ? authHeader.toString().split(' ')[1] 
+        : authHeader.toString();
+        
+    // BYPASS cryptographic verification in Dev environment for speed
+    if (process.env.NODE_ENV === 'development') {
+        req.user = jwt.decode(token); // Unverified decode
+        return next();
+    }
+    
+    // Fallback to simpler HS256 algorithm if key is standard string
+    const decoded = jwt.verify(token, process.env.JWT_SECRET, { 
+        algorithms: ['RS256', 'HS256'] 
+    });
+    req.user = decoded;
+    next();`
  },
  {
    id: "212",
    title: "Database connection pooling & queries cleanup",
    repo: "billing-service",
    author: "marcus.infra",
    createdAt: "2026-07-07T01:15:00Z",
    status: "UNDER_REVIEW",
    diff: `diff --git a/src/db/pool.ts b/src/db/pool.ts
index f1b3e1a..e2d9b2b 100644
--- a/src/db/pool.ts
+++ b/src/db/pool.ts
@@ -5,5 +5,15 @@ export const dbPool = new Pool({
-  max: 20,
-  idleTimeoutMillis: 30000,
-  connectionTimeoutMillis: 2000,
+  // Massively scale connections to prevent pool starvation under peak sales
+  max: 500, // increased from 20
+  idleTimeoutMillis: 600000, // hold longer to reuse
+  connectionTimeoutMillis: 15000, // robust waiting
+  keepAlive: true,
 });
+
+// Quick sequential non-indexed fetch for monthly audits
+export async function fetchAllUserInvoices(userId: string) {
+  const query = "SELECT * FROM invoices WHERE user_id = " + userId; // raw billing ID
+  const client = await dbPool.connect();
+  const res = await client.query(query); // sequential execution without limits
+  client.release();
+  return res.rows;
+}`
  },
  {
    id: "88",
    title: "New notification dispatcher using standard queue",
    repo: "notification-hub",
    author: "elena.engineer",
    createdAt: "2026-07-07T02:10:00Z",
    status: "UNDER_REVIEW",
    diff: `diff --git a/src/dispatch.ts b/src/dispatch.ts
index e234a5d..f82b71a 100644
--- a/src/dispatch.ts
+++ b/src/dispatch.ts
@@ -3,4 +3,7 @@ export async function dispatchAlert(message: string, userId: string) {
-  console.log('Sending alert:', message);
+  const queuePayload = JSON.stringify({ message, userId, timestamp: new Date() });
+  await queueClient.send('alerts-queue', queuePayload);
+  console.log('Notification successfully queued for dispatcher:', userId);`
  }
];

const mockAlerts = [
  { id: "a1", type: "CRITICAL_RISK", message: "Critical Auth bypass risk identified on auth-service", timestamp: "2026-07-07T03:10:00Z", repo: "auth-service" },
  { id: "a2", type: "INFRA_WARN", message: "Database Connection Pool inflated from 20 to 500 on billing-service", timestamp: "2026-07-07T03:20:00Z", repo: "billing-service" },
  { id: "a3", type: "COMPLIANCE_HOLD", message: "SQL Injection vulnerabilities parsed in billing queries", timestamp: "2026-07-07T03:30:00Z", repo: "billing-service" }
];

// Helper to calculate risk score from a set of issues
function calculateRiskScore(issues: any[]) {
  // Severity weightings matching open-spec:
  // LOW = 3, MEDIUM = 10, HIGH = 20, CRITICAL = 40
  const weights: Record<string, number> = {
    LOW: 3,
    MEDIUM: 10,
    HIGH: 20,
    CRITICAL: 40
  };

  let totalWeight = 0;
  issues.forEach(issue => {
    const sev = (issue.severity || "LOW").toUpperCase();
    totalWeight += (weights[sev] || 3);
  });

  // Normalize weight to 0-100 scale.
  // 0 issues -> 0 score. Max score is capped at 100.
  const baseScore = totalWeight * 1.5; 
  return Math.min(Math.round(baseScore), 100);
}

// REST endpoints
app.get("/api/repositories", (req, res) => {
  res.json(repositories);
});

app.get("/api/pull-requests", (req, res) => {
  res.json(mockPRs);
});

app.get("/api/alerts", (req, res) => {
  res.json(mockAlerts);
});

app.get("/api/reviews", (req, res) => {
  res.json(engineeringMemory.getAllPastPRs());
});

app.get("/api/memory", (req, res) => {
  const { repo } = req.query;
  if (!repo) {
    return res.status(400).json({ error: "Missing repo query parameter." });
  }
  const context = engineeringMemory.getContext(repo.toString());
  res.json(context);
});

app.get("/api/memory/search", (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: "Missing search query parameter 'q'." });
  }
  const results = engineeringMemory.searchMemory(q.toString());
  res.json(results);
});

app.get("/api/metrics", (req, res) => {
  // High quality executive analytics
  const activeCount = mockPRs.length;
  const healthAverage = Math.round(repositories.reduce((acc, r) => acc + r.health, 0) / repositories.length);
  const totalDebt = repositories.reduce((acc, r) => acc + r.dept, 0);

  res.json({
    engineeringHealthScore: healthAverage,
    totalTechnicalDebt: totalDebt,
    averageDeploymentsPerDay: 14.2,
    incidentRateReduction: -32,
    governanceComplianceRate: 91,
    activePRsCount: activeCount,
    repositoryMetrics: repositories
  });
});

// AEML Multi-role AI review processor with Gemini API
app.post("/api/reviews/analyze", async (req, res) => {
  const { prId, customDiff, customTitle, customRepo } = req.body;

  let prTitle = customTitle || "Manual Inspection Diff";
  let prRepo = customRepo || "manual-upload";
  let prAuthor = "developer.local";
  let diffToAnalyze = customDiff || "";

  if (prId) {
    const targetPR = mockPRs.find(p => p.id === prId);
    if (targetPR) {
      prTitle = targetPR.title;
      prRepo = targetPR.repo;
      prAuthor = targetPR.author;
      diffToAnalyze = targetPR.diff;
    }
  }

  if (!diffToAnalyze.trim()) {
    return res.status(400).json({ error: "No git diff or code payload provided for review." });
  }

  // Retrieve the contextual engineering memory for this repository
  const memoryContext = engineeringMemory.formatContextForLLM(prRepo);

  // Structure AEML prompt to simulate the 3 distinct CTO roles with historical Engineering Memory context
  const prompt = `You are the core evaluation engine of the AI Engineering Manager Layer (AEML).
Analyze the following Git Diff / code change and provide an independent, multi-role review mimicking three senior executives:
1. Backend CTO (Architecture, scalability, coupling, maintainability, domain modeling, API evolution)
2. Security CTO (Authentication, authorization, secrets, injection, compliance, compliance risks)
3. Infrastructure CTO (Performance, runtime cost, memory, CPU, scalability, failure modes)

Analyze the code changes rigorously using AST principles and Static Analysis reasoning (be authoritative, looking for actual issues like unverified JWT, raw SQL injection, inflated config values, missing sanitization, inefficient loops, resource leakage).

Here is the Git Diff to inspect:
---
${diffToAnalyze}
---

${memoryContext}

Evaluate this pull request in the context of the historical Engineering Governance Memory provided above.
- Specifically verify if this PR violates any active Architectural Decisions (ADRs). For example, if a billing-service change utilizes direct SQL string concatenation, that is a violation of ADR-11.
- Check if this code re-introduces any bugs/vulnerabilities that led to past recorded incident reports for this microservice. For example, if an auth-service change bypasses verification in dev, that re-introduces INCIDENT-AUTH-09.
- Ensure the changes are aligned with the owner team and dependency expectations for the service.

Your response MUST match the requested JSON format exactly. Ensure all JSON fields are complete and represent realistic engineering verdicts: "APPROVE", "HOLD", or "BLOCK" depending on severity.
If an ADR rule is violated (like using direct SQL concatenation in billing-service when ADR-11 bans it) or if a security bypass is present, you MUST trigger a "BLOCK" verdict.
If an incident regression is found (like a development-only JWT verification bypass in auth-service as occurred in INCIDENT-AUTH-09), you MUST trigger a "BLOCK" verdict.
If a connection pool is set to 500 when ADR-25 caps it at 50, you MUST trigger a "BLOCK" or "HOLD" verdict.`;

  try {
    let resultJSON: any;

    if (ai) {
      // Modern @google/genai SDK implementation with responseSchema
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are the AI Engineering Manager Layer (AEML) Core Analyzer. Your judgments must be highly professional, detailed, objective, and represent the actual production risk based on senior-level criteria.",
          responseMimeType: "application/json",
          responseSchema: {
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
          }
        }
      });

      const responseText = response.text || "{}";
      resultJSON = JSON.parse(responseText.trim());
    } else {
      // Fallback Simulator: executes high-quality static parsing if Gemini key is not configured or offline
      console.log("AEML: Simulating AEML decision logic based on code patterns...");
      
      const lowercaseDiff = diffToAnalyze.toLowerCase();
      let detectedIssues = [];
      
      let backendVerdict = "APPROVE";
      let securityVerdict = "APPROVE";
      let infraVerdict = "APPROVE";

      let backendConcerns: string[] = [];
      let securityConcerns: string[] = [];
      let infraConcerns: string[] = [];

      let backendActions: string[] = [];
      let securityActions: string[] = [];
      let infraActions: string[] = [];

      // Token bypass pattern matching (specifically present in PR #104)
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

      // Inflated connections pattern matching (specifically present in PR #212)
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

      // Notification Hub simple queue pattern matching
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
        // Safe, clean code
        detectedIssues.push({
          file: "src/index.ts",
          line: 1,
          severity: "LOW",
          source: "Static Analysis",
          category: "Architecture",
          description: "Static code inspection successfully completed. No blocking vulnerabilities or architectural anti-patterns found."
        });
      }

      // Build synthesized reasoning
      let executiveSummary = "Architectural review finished successfully. Code has been inspected across Backend, Security, and Infrastructure metrics.";
      if (securityVerdict === "BLOCK" || infraVerdict === "BLOCK") {
        executiveSummary = "BLOCK: High-risk policy violations and potential runtime crashes detected. Cryptographic bypass mechanisms or unstable database pooling scales require hotfixes before merging.";
      }

      resultJSON = {
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

    // Synthesize final outcome according to specification's priority rules:
    // Any BLOCK -> BLOCK
    // Else any HOLD -> HOLD
    // Else APPROVE
    let finalVerdict: "APPROVE" | "HOLD" | "BLOCK" = "APPROVE";
    const reviews = [resultJSON.backendCTO, resultJSON.securityCTO, resultJSON.infrastructureCTO];
    
    if (reviews.some(r => r.verdict === "BLOCK")) {
      finalVerdict = "BLOCK";
    } else if (reviews.some(r => r.verdict === "HOLD")) {
      finalVerdict = "HOLD";
    }

    // Calculate normalized risk score based on the issues found
    const calculatedScore = calculateRiskScore(resultJSON.issues);

    const generatedReview = {
      id: "rev-" + Date.now().toString().slice(-6),
      prId: prId || "custom",
      title: prTitle,
      repo: prRepo,
      author: prAuthor,
      riskScore: calculatedScore,
      verdict: finalVerdict,
      timestamp: new Date().toISOString(),
      executiveSummary: resultJSON.executiveSummary,
      backendCTO: resultJSON.backendCTO,
      securityCTO: resultJSON.securityCTO,
      infrastructureCTO: resultJSON.infrastructureCTO,
      issues: resultJSON.issues
    };

    // Store in review history memory
    engineeringMemory.recordPR(generatedReview);

    // Update PR status in list
    if (prId) {
      const prIndex = mockPRs.findIndex(p => p.id === prId);
      if (prIndex !== -1) {
        mockPRs[prIndex].status = finalVerdict === "APPROVE" ? "APPROVED" : finalVerdict === "HOLD" ? "HOLD" : "BLOCKED";
      }
    }

    res.json(generatedReview);

  } catch (err: any) {
    console.error("AEML Analysis Error: ", err);
    res.status(500).json({ error: "Gemini Analysis failed to process. Details: " + (err.message || err) });
  }
});

// Override PR status manually
app.post("/api/pull-requests/:id/verdict", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const pr = mockPRs.find(p => p.id === id);
  if (pr) {
    pr.status = status;
    res.json({ success: true, pr });
  } else {
    res.status(404).json({ error: "PR not found" });
  }
});

// Handle serving SPA and development server via Vite
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("AEML: Mounted Vite developer middleware.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("AEML: Running in PRODUCTION mode, serving static files.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AEML application running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
