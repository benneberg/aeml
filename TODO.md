# Technical Todo List

Detailed roadmap of engineering improvements, architectural enhancements, and future work.

---

## 1. High Priority (Security & Reliability)
- [ ] **Durable Database Integration**: Transition the in-memory variables (`repositories`, `pullRequests`, `reviewsHistory`) into a persistent Firebase Firestore or Cloud SQL database.
- [ ] **OAuth Authentication**: Implement real GitHub/GitLab OAuth sign-in hooks to authorize team access to organization governance logs.
- [ ] **Token Pagination**: Limit the historic reviews ledger query size. If the history grows, paginate records to prevent memory exhaustion on server containers.

---

## 2. Medium Priority (API & Tooling)
- [ ] **Lint Pre-commit Hook**: Integrate Husky to run `npm run lint` and verify type definitions before a developer can commit changes.
- [ ] **GitHub Action Integration**: Build a reusable GitHub Action that calls the AEML Express API dynamically on pull request creation and pushes inline comments back to the PR file line.
- [ ] **Configurable Severity Weights**: Expose configuration settings in the UI to allow organizations to redefine category multipliers (e.g., set CRITICAL severity to 50 instead of 40).

---

## 3. Low Priority (User Experience)
- [ ] **Dark Mode Toggle**: Offer a dark/light visual theme preset conforming to the Inter/Space Grotesk typography guidelines.
- [ ] **Historical Trend Charts**: Implement time-series Recharts graphs in the Executive Dashboard showing weekly compliance trends over 6-month intervals.
