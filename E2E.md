# RecoveryLog Playwright E2E Tests

RecoveryLog includes Playwright coverage for the two highest-value authenticated browser flows: completing the daily check-in wizard and downloading Pro chart data as CSV and PDF.

## What the suite verifies

| Flow              | Coverage                                                                                                                            |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Daily check-in    | Accessible radio selection, six-step progress, save success state, local-day duplicate handling, reload, and edit entry path.       |
| Pro chart exports | Authenticated analytics rendering, CSV download filename, PDF download filename, browser download path, and Free-plan locked state. |

The tests use Playwright request interception with explicit test-only user, check-in, analytics, and file payloads. They do not connect to the production database, invoke OAuth, create real wellness records, or call the LLM. This makes the suite deterministic and prevents test data from entering user accounts. Server-side authentication and entitlement boundaries remain covered separately by Vitest and the tRPC procedures.

## Commands

```bash
pnpm test:e2e
pnpm test:e2e:headed
```

The configuration reuses the managed development server when it is already running. In CI, Playwright starts `pnpm dev`, launches the installed system Chromium by default, runs serially, retries failed tests twice, and keeps traces and screenshots for failures. Override `PLAYWRIGHT_BASE_URL` or `PLAYWRIGHT_EXECUTABLE_PATH` when running against another environment.

## Extension guidance

When adding another authenticated flow, extend the fixture router with the narrowest possible response for that procedure and keep the data synthetic and local to the test. Add a browser assertion for the visible outcome and a server-side authorization test for the procedure itself. Do not place OAuth cookies, real email addresses, production database identifiers, API keys, or generated wellness data in the repository.
