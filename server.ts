import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { engineeringMemory } from "./server/engineeringMemory";
import { roleReviewEngine } from "./server/roleReviewEngine";

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

// Global severity weightings configuration
let globalSeverityWeights: Record<string, number> = {
  LOW: 3,
  MEDIUM: 10,
  HIGH: 20,
  CRITICAL: 40
};

// Helper to calculate risk score from a set of issues
function calculateRiskScore(issues: any[]) {
  let totalWeight = 0;
  issues.forEach(issue => {
    const sev = (issue.severity || "LOW").toUpperCase();
    totalWeight += (globalSeverityWeights[sev] !== undefined ? globalSeverityWeights[sev] : 3);
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

app.get("/api/config", (req, res) => {
  res.json({ severityWeights: globalSeverityWeights });
});

app.post("/api/config", (req, res) => {
  const { severityWeights } = req.body;
  if (severityWeights) {
    globalSeverityWeights = {
      LOW: parseInt(severityWeights.LOW) || 3,
      MEDIUM: parseInt(severityWeights.MEDIUM) || 10,
      HIGH: parseInt(severityWeights.HIGH) || 20,
      CRITICAL: parseInt(severityWeights.CRITICAL) || 40
    };
    return res.json({ success: true, severityWeights: globalSeverityWeights });
  }
  res.status(400).json({ error: "Missing severityWeights in body." });
});

app.get("/api/reviews", (req, res) => {
  const allReviews = engineeringMemory.getAllPastPRs();
  
  // If no page and no limit query is provided, return all reviews as an array
  if (!req.query.page && !req.query.limit) {
    return res.json(allReviews);
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 5;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedData = allReviews.slice(startIndex, endIndex);

  res.json({
    data: paginatedData,
    total: allReviews.length,
    page,
    limit,
    totalPages: Math.ceil(allReviews.length / limit)
  });
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

  try {
    const analysisResult = await roleReviewEngine.reviewPullRequest(ai, diffToAnalyze, prRepo);

    // Synthesize final outcome according to specification's priority rules:
    // Any BLOCK -> BLOCK
    // Else any HOLD -> HOLD
    // Else APPROVE
    let finalVerdict: "APPROVE" | "HOLD" | "BLOCK" = "APPROVE";
    const reviews = [analysisResult.backendCTO, analysisResult.securityCTO, analysisResult.infrastructureCTO];
    
    if (reviews.some(r => r.verdict === "BLOCK")) {
      finalVerdict = "BLOCK";
    } else if (reviews.some(r => r.verdict === "HOLD")) {
      finalVerdict = "HOLD";
    }

    // Calculate normalized risk score based on the issues found
    const calculatedScore = calculateRiskScore(analysisResult.issues);

    const generatedReview = {
      id: "rev-" + Date.now().toString().slice(-6),
      prId: prId || "custom",
      title: prTitle,
      repo: prRepo,
      author: prAuthor,
      riskScore: calculatedScore,
      verdict: finalVerdict,
      timestamp: new Date().toISOString(),
      executiveSummary: analysisResult.executiveSummary,
      backendCTO: analysisResult.backendCTO,
      securityCTO: analysisResult.securityCTO,
      infrastructureCTO: analysisResult.infrastructureCTO,
      issues: analysisResult.issues
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
