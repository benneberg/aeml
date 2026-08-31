# Technical Todo List

Detailed roadmap of engineering improvements, architectural enhancements, and future work.

---

## 1. High Priority (Security & Reliability)
- [x] **Durable Database Integration**: Transition the in-memory variables (`repositories`, `pullRequests`, `reviewsHistory`, `severityWeights`) into persistent storage via `server/persistenceAdapter.ts` saving to `.data/aeml_db.json`.
- [x] **OAuth Authentication**: Implemented VCS / GitHub / GitLab OAuth token verification and RBAC team role switcher in `AuthModal.tsx` and Express auth routes `/api/auth/*`.
- [x] **Token Pagination**: Implemented query size pagination on `/api/reviews` with page & limit parameters and client navigation controls.

---

## 2. Medium Priority (API & Tooling)
- [x] **Lint Pre-commit Hook**: Integrated `.husky/pre-commit` hook and package.json `pre-commit` / `test` scripts to execute `npm run lint`.
- [x] **GitHub Action Integration**: Built reusable workflow `/.github/workflows/aeml-governance.yml` that analyzes PR diffs and posts executive reviews.
- [x] **Configurable Severity Weights**: Exposed dynamic weight policy controls in `SpecView.tsx` and `/api/config` with live metric recalculation.

---

## 3. Low Priority (User Experience)
- [x] **Dark Mode Toggle**: Built universal dark/light theme toggle in header with full color palette styling across all views.
- [x] **Historical Trend Charts**: Implemented time-series Recharts graphs in `DashboardView.tsx` supporting 7-day and 6-month compliance interval inspection.

