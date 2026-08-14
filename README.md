# RecoveryLog

> **Understand your patterns. Recover smarter.**

RecoveryLog is a mobile-first personal wellness tracking MVP. Users complete a short daily check-in for sleep quality, energy, stress, soreness, mood, and optional sleep duration. The application calculates a deterministic **personal recovery indicator** and helps users review their own trends. It does not diagnose health conditions or provide medical advice.

## Product scope

| Area                    | Included in this build                                                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Public experience       | Marketing page, product explanation, Free/Pro framing, FAQ, metadata, Open Graph basics, and favicon.                                      |
| Identity                | Manus OAuth, session persistence, protected routes, sign-out, and account-managed identity information.                                    |
| Core loop               | Timezone-aware check-in wizard, one editable record per local calendar day, deterministic score, dashboard, and seven-day trend.           |
| Private record          | Calendar history, entry edits/deletion, 30-day analytics, streak, and comparison when data supports it.                                    |
| AI                      | Server-only, cached, schema-validated pattern observations after seven entries and Pro entitlement.                                        |
| Future-ready operations | Subscription entitlements, reminder preference storage, authenticated scheduler callback boundary, privacy deletion, and deployment notes. |

## Technical architecture

The application uses React, TypeScript, Tailwind CSS, Express, tRPC, Drizzle, the managed MySQL/TiDB database, and Manus OAuth. `ARCHITECTURE.md` explains the domain model, routes, privacy boundaries, and operational decisions. `SECURITY.md` documents the tenant-isolation strategy and limitations.

## Local validation

```bash
pnpm check
pnpm test
pnpm build
```

The managed development server is started with `pnpm dev`. The platform supplies database, OAuth, and LLM configuration to the server environment; never commit an actual `.env` file or expose a server credential to the browser.

## Score formula

Sleep quality and energy are mapped from 1–5 to 0–100. Stress and soreness use the same scale in reverse; mood maps to Good = 100, Okay = 60, and Low = 20. The final score is the rounded, clamped weighted sum:

| Component                | Weight |
| ------------------------ | -----: |
| Sleep quality            |    30% |
| Energy                   |    25% |
| Stress, reverse-scored   |    20% |
| Soreness, reverse-scored |    15% |
| Mood                     |    10% |

The category thresholds are Excellent (80–100), Good (65–79), Moderate (50–64), and Low (0–49). Tests cover the formula, reverse scoring, category boundaries, timezones, authentication logout, and entitlement boundaries.

## Important implementation limits

RecoveryLog’s AI feature is informational only and includes a visible disclaimer. It uses de-identified summary statistics, not email or raw personal profile data. Reminder delivery and payment processing are deliberately unconfigured in this MVP; their secure lifecycle and data boundaries are implemented, but the application does not state that an email, push notification, payment, or Pro upgrade occurred when it has not.

For detailed rollout instructions, see `DEPLOYMENT.md`.

## Pro chart exports

Pro users can export the 30-day recovery chart data as CSV or PDF from the Analytics page. The export procedures are protected on the server, re-check the user’s `pro` entitlement, query only that user’s local-date chart points, and return a browser download payload. Free users see the locked capability state and cannot invoke the procedures. The PDF is an informational table of dated recovery scores and includes the non-medical disclaimer; neither format includes other users’ records, profile details, or AI insight content.
