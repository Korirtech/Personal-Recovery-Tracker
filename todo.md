# RecoveryLog Project TODO

- [x] Define the application information architecture, route map, shared domain types, and privacy boundaries.
- [x] Design and apply a calm, premium, mobile-first wellness visual system with accessible color and typography tokens.
- [x] Create database schema and migration for profiles, daily_checkins, insights, notification_preferences, and subscriptions with constraints, indexes, and ownership protection.
- [x] Add database query helpers and typed server contracts for all recovery tracking features.
- [x] Build the public marketing landing page with hero, how-it-works, features, AI safety section, pricing, FAQ, and footer.
- [x] Add metadata, Open Graph tags, semantic document structure, robots directives, and favicon assets.
- [x] Integrate Manus OAuth account access, persistent session handling, protected application routes, and authenticated loading/error states.
- [x] Build editable profile and settings flows for display name, read-only Manus account email, IANA timezone, reminder time, and notification preference.
- [x] Implement a timezone-aware, step-by-step daily check-in wizard with accessible controls, progress, back navigation, validation, draft preservation, and safe retry behavior.
- [x] Enforce one editable check-in per local calendar day and provide clear duplicate-entry handling.
- [x] Implement a single reusable deterministic Recovery Score service with weighted scoring, reverse scoring, clamping, categories, and safe non-medical language.
- [x] Build the protected dashboard with personalized greeting, score visual, metric breakdown, contextual non-medical suggestion, and seven-day trend state handling.
- [x] Create check-in history with calendar navigation, detail viewing, editing, deletion, and intentional empty/loading/error states.
- [x] Build 30-day analytics with aggregate metrics, check-in streak, comparisons when sufficient data exists, and accessible responsive charts.
- [x] Implement tier and entitlement data contracts for Free and Pro capabilities without processing payments.
- [x] Implement deterministic pattern analysis using only necessary, private check-in data and a seven-check-in minimum threshold.
- [x] Integrate server-side LLM insight generation with structured Zod validation, non-medical guardrails, database caching, and graceful fallback states.
- [x] Display AI safety disclaimers anywhere generated insights appear and prevent unsafe or unvalidated output from rendering.
- [x] Add a timezone-aware daily reminder architecture with an enabled state, local-time scheduling strategy, and safe copy.
- [x] Create account deletion, data deletion, privacy messaging, and future data-export architecture.
- [x] Add a typed, provider-independent data-export boundary for a future Pro export workflow.
- [x] Complete the delete-data success state and redirect after the protected server deletion completes.
- [x] Add unit tests for the scoring engine, date and duplicate-entry logic, analytics calculations, entitlement checks, and insight validation.
- [x] Add integration and UI tests for protected access, check-in creation and editing, dashboard rendering, validation, errors, and empty states.
- [x] Complete source-level keyboard/accessibility review and provide a post-publish live keyboard QA runbook.
- [x] Run type checking, linting, tests, production build, and visual verification; resolve reported errors.
- [x] Document architecture, database setup, configuration, security considerations, known limitations, and publishing steps in README and deployment notes.
- [x] Capture responsive and code-level accessibility evidence across mobile, tablet, desktop, and wide-desktop breakpoints; document the live keyboard QA procedure.
- [x] Add and run a non-destructive lint-equivalent validation step in the project quality gate.
- [x] Add a managed database and configuration setup section to the production documentation without creating a local environment file.
- [x] Confirm the GitHub repository identity for Personal-Recovery-Tracker and preserve any existing remote history.
- [x] Commit and synchronize the final RecoveryLog source to the selected GitHub repository.
- [x] Verify the remote repository contents and record the synchronization result.

# Analytics UX enhancement

- [x] Add analytics loading animations, retryable error state, and transition-safe query behavior.

# Pro chart export enhancement

- [x] Define the Pro-only export scope, formats, entitlement enforcement, and privacy-safe data contract.
- [x] Implement authenticated CSV and PDF chart-data export generation from the user’s own analytics records.
- [x] Add Pro export controls, locked Free state, loading state, and accessible download feedback to analytics.
- [x] Add export authorization, CSV escaping, PDF output, and analytics UI regression coverage.
- [x] Run type checks, tests, production build, visual verification, and save the export checkpoint.

# Playwright E2E enhancement

- [x] Define isolated Playwright browser setup, test-only authentication strategy, and fixture boundaries.
- [x] Add an end-to-end daily check-in flow covering validation, progress, submission, duplicate-day handling, and edit behavior.
- [x] Add an end-to-end Pro export flow covering entitlement UI, CSV download, PDF download, and download failure handling.
- [x] Add Playwright scripts, browser configuration, CI-friendly startup, and test documentation without exposing real user data.
- [x] Run Playwright plus the existing type, unit, and production checks; document environment limitations and checkpoint the result.

# GitHub Actions Playwright CI enhancement

- [x] Add a GitHub Actions workflow that installs dependencies, runs the managed dev server, and executes Playwright in CI mode.
- [x] Configure CI browser/runtime caching and upload Playwright traces/screenshots on failure.
- [x] Document workflow triggers, required environment assumptions, and local CI-equivalent commands.
- [x] Run local CI-equivalent checks, push the workflow, trigger GitHub Actions, and verify the result.

# Render deployment manifest enhancement

- [x] Define the Render service, health check, build/start commands, and required environment-variable contract.
- [x] Add render.yaml and document Render database, OAuth, LLM, and secret configuration steps.
- [x] Validate render.yaml syntax and the production build, then checkpoint the deployment manifest.
