# RecoveryLog Security Notes

RecoveryLog treats check-ins and derived wellness patterns as private user data. It uses Manus OAuth as its only identity provider and never stores passwords or provider API credentials in the client.

| Control            | Implementation                                                                                                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Authentication     | Manus OAuth session cookies and the supplied protected-procedure guard.                                                                                                         |
| Tenant isolation   | Every private query and mutation includes the authenticated `userId`; update and delete operations additionally scope the target record to that user.                           |
| Data integrity     | Foreign keys, a unique user-plus-local-date check-in rule, response range checks, valid mood values, and a score range check are enforced in the database.                      |
| Validation         | tRPC accepts Zod-validated profile, reminder-time, check-in, history, and ID inputs.                                                                                            |
| AI boundary        | The LLM is called only server-side, after deterministic aggregation. Output must match strict JSON and Zod schemas, then pass safety filtering before it is cached or rendered. |
| Privacy controls   | Users can delete all RecoveryLog application data; the interface explicitly distinguishes this from deleting the separate Manus identity account.                               |
| Scheduled callback | The reminder callback rejects non-scheduler traffic and resolves the relevant preference from the platform-issued task ID, not an untrusted request body.                       |

The managed MySQL/TiDB database does not provide PostgreSQL-style Row Level Security. RecoveryLog therefore uses authenticated server procedures, owner-scoped predicates, foreign keys, and constrained query helpers as its tenant-isolation control. A future migration to PostgreSQL could add native RLS without changing the domain model.

## Known limitations

The MVP includes a reminder preference model and authenticated scheduling callback, but no user email, push, or webhook delivery provider is configured. It therefore does not claim that a reminder was sent. The scheduler lifecycle can be activated only after a delivery adapter is connected and the site has been deployed.

Payment processing is intentionally absent. The `subscriptions` table and `getRecoveryEntitlements` service are ready to isolate a future Stripe, M-Pesa, or PayPal integration.
