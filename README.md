# AI Engineering Manager Layer (AEML)

A mobile-first engineering management and governance platform that evaluates code changes using structured reasoning, static analysis, organizational knowledge, and role-based AI reviewers.

## Core Concepts

AEML simulates a senior engineering leadership organization that reviews pull requests. Rather than focusing on simple syntax issues or styling, it evaluates:
1. **Should this PR be merged?**
2. **What is the production and deployment risk?**
3. **Which engineering discipline would object?** (e.g., Backend, Security, Infrastructure)
4. **What long-term technical debt is introduced?**
5. **What organizational policies must be satisfied?**

## Features

- **Role-Based AI Reviews**: Simulates Backend CTO, Security CTO, and Infrastructure CTO reviews independently.
- **Diff Analyzer & Parser**: Allows entering custom code diffs or selecting predefined examples to trigger real-time, server-side Gemini API-powered reviews.
- **Risk Score Calculator**: Normalizes low, medium, high, and critical issues to a 0–100 score.
- **Decision Synthesizer**: Implements the specification's priority rules (any `BLOCK` results in a BLOCK verdict; any `HOLD` results in HOLD; otherwise `APPROVE`).
- **Interactive Mobile Dashboard**: View engineering health, repository health, risk trends, alert logs, and previous review history.

## Development Setup

The application is built on a full-stack architecture using **React (Vite)** on the frontend and an **Express** server on the backend to securely call the Gemini API.

### Installation
Ensure that the dependencies are installed and the server is configured:

```bash
npm install
```

### Running the Application
To launch the full-stack developer server:
```bash
npm run dev
```
The server binds to port `3000` as required by the reverse proxy.

## Implementation Details

- **Backend**: Serves compiled client files in production and proxies requests to the Gemini API securely using the modern `@google/genai` SDK on the server-side (`server.ts`).
- **Frontend**: A high-fidelity, responsive, mobile-first design with smooth state transitions, rich charts (Recharts) for executive dashboards, detailed review timelines, and interactive role panels.
- **Persistence**: Emulates persistent organization memory on the server for tracking previous reviews and repository alert trends.
