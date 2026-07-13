# Architecture & Design

This document details the software architecture, data flow, integrations, and deployment model of AEML.

---

## 1. System Components
AEML uses a full-stack architecture designed for responsive performance and high-fidelity rendering:

```
┌────────────────────────────────────────────────────────┐
│                      Client (SPA)                      │
│  - React, Tailwind, Lucide Icons, Recharts, Motion     │
└───────────────────────────┬────────────────────────────┘
                            │ (JSON over HTTP)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Server (Express)                     │
│  - server.ts: HTTP Route Controllers                   │
│  - server/roleReviewEngine.ts: LLM + Simulation Layer  │
│  - server/engineeringMemory.ts: ADR + Incident Memory  │
└────────────────────────────────────────────────────────┘
```

- **Client App (`src/App.tsx`)**: Renders a mobile-first viewport using an iOS mock device frame. Coordinates view state among the Dashboard, active Pull Request Sandbox, Audit History Logs, and Governance Spec Sheets.
- **Server Application (`server.ts`)**: Runs on Node.js using tsx in dev. In production, it is bundled by esbuild to a single CommonJS file (`dist/server.cjs`) and executed natively via node to achieve fast startup times.
- **Role Review Engine (`server/roleReviewEngine.ts`)**: Core logic module defining prompts, system instructions, and schema validation structures for Gemini LLM orchestration.
- **Engineering Memory Layer (`server/engineeringMemory.ts`)**: Holds simulated repository governance indexes, ADR records, and past production incident briefs. Supports token/search filtering.

*Confidence: High*

---

## 2. Core Data Flow
The primary data flow for Pull Request analysis:

```
[Developer submits Git Diff]
             │
             ▼
[POST /api/reviews/analyze (server.ts)]
             │
             ▼
[roleReviewEngine.reviewPullRequest()]
 ├─► (Has API Key?) ─► Yes ─► Query Gemini with role prompts and schema
 └─► (Offline Mode)  ─► No  ─► Parse AST code signatures using heuristics
             │
             ▼
[synthesizeReviewVerdict()]
 ├─► Parse role verdicts (APPROVE, HOLD, BLOCK)
 ├─► Priority evaluation: Any BLOCK -> BLOCK; any HOLD -> HOLD; else APPROVE
 └─► Calculate normalized risk score: low (3), medium (10), high (20), critical (40)
             │
             ▼
[Append generated review to history ledger]
             │
             ▼
[Return decision payload to client]
```

*Source of Truth: In-memory arrays on the server (simulating transactional database engines).*

*Confidence: High*

---

## 3. Integrations
- **AI Models**: Integrates the `@google/genai` TypeScript SDK, referencing the `gemini-3.5-flash` model for fast, structured JSON generation with complete schema definitions.
- **Local Dev / Production Bundlers**: Standardized compiler setup featuring esbuild and vite.

*Confidence: High*

---

## 4. Deployment Model
AEML is deployed using Dockerized containers running on **Cloud Run**.
- **Static Asset Serving**: The production server mounts static asset paths from `dist/` and falls back to index.html to support React SPA routes.
- **Network Routing**: Binds strictly to port `3000` on interface `0.0.0.0` as required for reverse-proxy routing.

*Confidence: High*

---

## 5. Risks & System Failures
- **Risk**: In-memory state reset on container cold starts.
- **Mitigation**: Introduce a persistent storage driver (Firestore).
- **Risk**: Missing `GEMINI_API_KEY` prevents LLM operation.
- **Mitigation**: The system detects missing keys and falls back to a high-fidelity AST heuristic parser automatically, maintaining a functional UI.

*Confidence: High*
