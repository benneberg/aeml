# AI Engineering Manager Layer (AEML)

[![CI Pipeline](https://img.shields.io/badge/CI-GitHub_Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white)](.github/workflows/ci.yml)
[![Node Version](https://img.shields.io/badge/Node.js-22_LTS-339933?style=flat-square&logo=nodedotjs&logoColor=white)](.nvmrc)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-3178C6?style=flat-square&logo=typescript&logoColor=white)](tsconfig.json)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](src/App.tsx)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS_v4-38B2AC?style=flat-square&logo=tailwindcss&logoColor=white)](src/index.css)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg?style=flat-square)](LICENSE)

AEML is an enterprise-grade engineering governance platform designed to simulate a senior engineering leadership organization. It evaluates pull requests and code changes against static patterns, architectural decisions (ADRs), and past incident history using a mixture of Gemini-powered multi-role reviews and local AST static heuristics.

---

## Getting Started

### 1. Installation
Install project dependencies from the root directory:
```bash
npm install
```

### 2. Run the Development Server
Launch the application with the fast-reloading TypeScript engine:
```bash
npm run dev
```
The server will boot and bind to port `3000` on host `0.0.0.0` as required.

### 3. Build & Production Deployment
Compile frontend and backend assets for distribution:
```bash
npm run build
```
This performs a production build of the Vite client (saving assets in `dist/`) and packages the Express backend into a bundled, stand-alone script (`dist/server.cjs`) with sourcemap tracking.

To launch the compiled server:
```bash
npm start
```

---

## Structural Architecture
- **Client App (`src/App.tsx`)**: Responsive, mobile-first design styled using Tailwind CSS and structured into a high-fidelity iOS hardware simulator frame.
- **Role Review Engine (`server/roleReviewEngine.ts`)**: Defines structured validation prompt schemas for the Backend, Security, and Infrastructure CTO AI personas.
- **Governance Database (`server/engineeringMemory.ts`)**: Simulates a persistence service containing historical company policies, ADR logs, and incident databases.

---

## Main Features
- **Deterministic Verdict Synthesis**: Applies logical gates: any `BLOCK` results in a BLOCK verdict; any `HOLD` results in a HOLD; otherwise, a code change is `APPROVED`.
- **Seamless Gemini Failover**: Detects when the `GEMINI_API_KEY` is missing and launches high-fidelity AST heuristic analyzers to perform offline audits.
- **Real-Time Memory Search**: Includes a real-time semantic query interface for searching governance policies and historical engineering notes.
