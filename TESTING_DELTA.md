# Testing Delta

This document identifies testing coverage gaps and outlines the testing roadmap required to secure AEML production deployments.

---

## Current Test Infrastructure
- **Status**: No formal automated test runner is integrated in the codebase.
- **Verification Method**: Manual validation through the interactive React dashboard and the TypeScript compiler step (`npm run lint`).

---

## Recommended Testing Architecture

### 1. Unit Testing Engine (Vitest)
Unit tests should target stateful service layers:
- `server/roleReviewEngine.ts`: Verify orchestration prompts generate expected JSON structure.
- `server/engineeringMemory.ts`: Verify search functions find correct contextual matches for incident codes or ADRs.
- `src/components/DashboardView.tsx`: Verify risk ring percentages reflect calculated risk scores.

### 2. Integration Testing (Supertest)
Verify API response boundaries and endpoints:
- `GET /api/repositories`: Validate repository metadata returns correct properties.
- `POST /api/reviews/analyze`: Mock Gemini API response and assert final verdict synthesizes correctly under "BLOCK", "HOLD", or "APPROVE" scenarios.

### 3. End-to-End Testing (Playwright)
Simulate real developer behavior in the iOS device frame:
- Submitting custom code diffs (e.g., JWT bypasses).
- Verifying the multi-role review modal displays tabs with appropriate warnings.

---

## Core Assertions & Delta Coverage Checklist
- [ ] Assert that `any BLOCK` verdict from role reviews triggers a final `BLOCK` decision.
- [ ] Assert that the connection pool check flags max pools > 50 with a `BLOCK` or `HOLD` verdict.
- [ ] Validate that the memory search endpoint performs matching across incident repositories.
