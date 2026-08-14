# RecoveryLog Production Preparation

RecoveryLog is built for the managed project runtime. Manus OAuth, the managed database, and the server-side LLM proxy are already configured by the project environment; no custom database or AI key belongs in browser code.

## Publish checklist

Run the type check, test suite, and production build before publishing. Create a project checkpoint, then use the **Publish** action in the project interface. Do not substitute a custom client-only host because the app relies on server-side OAuth sessions, private tRPC procedures, database access, and the AI proxy.

## Managed database and configuration

The project uses the managed MySQL/TiDB database supplied by the full-stack environment. Its tables are defined in `drizzle/schema.ts`; the applied RecoveryLog migrations are in `drizzle/0001_breezy_swordsman.sql` and `drizzle/0002_curious_vulture.sql`. To evolve the schema, update the Drizzle schema, generate a migration with `pnpm drizzle-kit generate`, review the generated SQL, and apply the reviewed migration through the managed database workflow. Do not add a separate local database connection string to client code.

Manus OAuth, the database connection, and the server-side LLM proxy are managed project configuration. Provider credentials for a future reminder adapter must be added through the project secret manager, never through an `.env` file committed to the repository or a Vite-prefixed variable. The current project does not require user-supplied secrets to run its implemented features.

## Reminder activation

The reminder callback is implemented at `/api/scheduled/recovery-reminder`, but a notification provider must be configured before any end-user messages can be delivered. Once an email, push, or verified webhook adapter is added, deploy the site, then provision or update each user’s platform-managed schedule using the persisted task ID. The callback is intentionally idempotent and will skip disabled preferences, completed daily check-ins, and repeated local-day executions.

## Verification scope

Public pages, authenticated empty states, and key mobile layouts have been reviewed. Because the application must not invent wellness entries, populated charts, historical editing, Pro insight generation, and actual reminder delivery must be exercised with a real user account and real consented entries after configuration.
