# RecoveryLog Architecture

RecoveryLog is a full-stack React and TypeScript application built on the managed Express and tRPC foundation. The public experience is available without an account, while wellness data is accessible only through authenticated procedures. The product maintains a strict distinction between a **personal recovery indicator** and any medical assessment. Neither deterministic suggestions nor AI-generated content may diagnose, treat, or claim causality.

| Layer                   | Responsibility                                                                                                                                        | Security boundary                                                                                                                     |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| React client            | Landing page, accessible product UI, guarded routes, forms, charts, and local draft state.                                                            | Receives only authenticated user data returned by typed procedures. It never receives provider credentials.                           |
| tRPC application server | Validates input, derives the caller identity, scopes each query by `ctx.user.id`, calculates deterministic results, and handles safe error responses. | `protectedProcedure` is mandatory for private resources. Object IDs are never accepted as authorization.                              |
| MySQL/TiDB database     | Stores account-linked profiles, check-ins, insight cache records, reminder preferences, and subscription entitlement state.                           | Foreign keys, unique keys, indexes, range constraints, and server-side ownership filters protect data integrity and tenant isolation. |
| AI integration          | Receives minimal, pre-aggregated, de-identified recovery pattern summaries, returning a Zod-validated JSON payload only.                              | The model key stays server-side. Unvalidated responses are discarded; no model content is rendered as HTML.                           |
| Scheduled reminders     | Uses platform-managed callbacks rather than in-process timers. The reminder owner is identified from a platform-issued task ID.                       | Each callback authenticates the scheduler and resolves the persisted preference record by task ID.                                    |

## Identity and authorization

RecoveryLog uses **Manus OAuth as the sole identity provider**. Sign-in, account creation, session persistence, credential management, and account recovery are therefore handled by the identity provider rather than by custom password storage. The application stores only identity-linked profile preferences. The OAuth account email remains the authenticated account identifier and is not silently changed inside RecoveryLog; any future contact-email feature would require its own verification workflow.

The managed database for this project is MySQL/TiDB. It does not offer PostgreSQL Row Level Security policies. To avoid implying otherwise, RecoveryLog enforces tenant isolation through a combination of foreign keys, uniqueness constraints, narrowly scoped query helpers, authenticated procedures, and explicit ownership predicates on every private read or mutation. This is documented as the project’s database-security strategy; an external PostgreSQL deployment could add native RLS as a later infrastructure change without changing the domain model.

## Core domain model

| Entity                     | Purpose                                                                       | Key invariants                                                                                                                |
| -------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `profiles`                 | User-owned presentation and local-time preferences.                           | Exactly one profile per authenticated user; timezone is an IANA identifier; reminder time is stored as a local `HH:MM` value. |
| `daily_checkins`           | A timestamped local-day wellness entry and its deterministic score snapshot.  | One entry per user and local date; ordinal measures are constrained to 1–5; duration is constrained to 0–24 hours.            |
| `insights`                 | Cached, structured, safety-reviewed AI insight records.                       | Validated JSON fields only; a stable data fingerprint prevents needless regeneration.                                         |
| `notification_preferences` | Reminder enablement, local schedule, delivery state, and scheduler reference. | One preference record per user; the scheduler task ID is unique when present.                                                 |
| `subscriptions`            | Future-proof Free/Pro entitlement state, independent of a payment provider.   | One subscription record per user; the initial plan is `free`; payments are intentionally out of scope.                        |

## Route map

| Route        | Access              | Purpose                                                                                 |
| ------------ | ------------------- | --------------------------------------------------------------------------------------- |
| `/`          | Public              | Marketing landing page with product explanation, pricing, FAQ, and sign-in entry point. |
| `/dashboard` | Authenticated       | Today’s personal recovery indicator, metric breakdown, and seven-day trend.             |
| `/check-in`  | Authenticated       | Mobile-first daily check-in wizard; the existing local-day entry is loaded for editing. |
| `/history`   | Authenticated       | Calendar and detailed check-in history with edit and delete actions.                    |
| `/analytics` | Authenticated       | Long-range private trend metrics and charts.                                            |
| `/insights`  | Authenticated / Pro | Safety-reviewed AI-generated pattern observations after the minimum data threshold.     |
| `/profile`   | Authenticated       | Display name, timezone, reminder settings, privacy actions, and plan state.             |

The client resolves all private data through typed tRPC procedures. The procedures are mounted under `/api/trpc`; scheduled reminder callbacks will be isolated under `/api/scheduled/recovery-reminder` once the reminder feature is enabled and deployed.

## Date, scoring, and privacy conventions

All event timestamps are persisted in UTC. The `localDate` field represents the calendar date in the user’s saved IANA timezone at the time a check-in is created or edited, which makes the “one check-in per day” rule deterministic. The score is calculated once in a reusable domain service and persisted with the responses so that later formula versions can be introduced deliberately rather than rewriting historical data.

AI analysis is a premium, informational feature. At least seven completed check-ins are required before an insight can be considered. The server first derives summary statistics and evidence counts, omits email and direct identifiers, and then validates structured model output before caching or showing it. The interface must always state that insights are based on logged patterns and are **not medical advice or a diagnosis**.

## Delivery and operational boundaries

The application is designed for managed autoscaling deployment. Daily reminders use a platform-managed authenticated callback at `/api/scheduled/recovery-reminder`; no in-process timer, polling loop, or long-running worker is introduced. The `notification_preferences.scheduleCronTaskUid` field links a future per-user schedule to its owning preference and lets the callback look up the preference by trusted task ID rather than mutable request data. The callback is idempotent, skips duplicate local-day work, and skips users who have already checked in.

An end-user email, push, or verified webhook delivery provider has not been configured for this project. Accordingly, RecoveryLog persists reminder preferences and ships the scheduler callback boundary, but does **not** claim to send notifications. Before activation, a delivery adapter and its server-only credentials must be connected, the site must be deployed, and the per-user scheduler lifecycle must be provisioned. This keeps the system truthful and avoids creating silent or misleading reminder behavior.

Payment execution is excluded from this MVP. The `subscriptions` table and `getRecoveryEntitlements` service keep Free and Pro feature checks isolated from any later Stripe, M-Pesa, or PayPal integration. The current initial entitlement is `free`; no charge, checkout, or plan upgrade action is presented.
