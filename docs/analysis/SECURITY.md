# Security

> Consolidated posture for the **Tax Invoice Issuer** study project, merging: code review (2026-09-02), the historical audit docs (`SECURITY-AUDIT-SUMMARY.md`, `SECURITY-AUDIT-FINAL-REPORT.md`, `SECURITY-FIX-GUIDE.md`), [SECURITY-ARCHITECTURE-REVIEW.md](../SECURITY-ARCHITECTURE-REVIEW.md) and [ADR-001](../ADR-001-secrets-management.md).

## Current posture (verified in code)

| Control                        | State         | Evidence                                                                                                               |
| ------------------------------ | ------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Secrets out of code            | ✅            | `requiredSecret()` in `infra/config/env/env.config.ts` → `SecretError` fail-fast; `.env.example` has placeholders only |
| SQL injection                  | ✅            | parameterized queries only (`$1` placeholders via pg-promise); no string interpolation anywhere                        |
| Input validation               | ✅            | Zod 4 specifications behind `@Validate` decorator on both controllers; 400 `ValidationDataError` envelope              |
| Dependency signing in CI       | ✅            | images signed with **cosign**; OIDC keyless auth from GitHub Actions → Azure                                           |
| Non-root container             | ✅            | `node:25-slim` + `USER node` in Dockerfile                                                                             |
| Transport encryption           | ⚠️            | HTTP only (dev scope); Azure front terminates TLS                                                                      |
| Authentication / Authorization | ❌ absent     | acceptable for a study project; flagged in roadmap                                                                     |
| Rate limiting / headers        | ❌ absent     | no helmet/rate-limit middleware                                                                                        |
| Email credentials              | ✅ n/a in dev | MailHog has no auth; prod path uses Azure Communication Services (see deploy docs)                                     |

## Vulnerability history (from audit docs)

The PT originals (now translated) record a three-pass audit; all **Critical/High** items were closed before the 2026-08 hardening commit. Salient fixed items: `http` → typed `statusError` presenter (commit `f1b551c`), env-guard for `DATABASE_URL`, dependency bumps (Express 5, Zod 4). Remaining lows are listed as debt below.

## Technical debt (single source of truth)

| #   | Item                                                         | Why it matters                               | Suggested action                                          |
| --- | ------------------------------------------------------------ | -------------------------------------------- | --------------------------------------------------------- |
| 1   | Dead Prisma (`prisma` dep + `npm run db:sync`)               | 100% unused; confusing + supply-chain weight | remove dep & script (or actually adopt Prisma)            |
| 2   | `swagger-ui-express` redirect loop on `/docs`                | `/docs` unusable on Express 5                | pin UI version / mount on explicit path / drop swagger-ui |
| 3   | Route re-registration bug in `express.server.ts#on()`        | re-adds every route on each `on()` call      | move `routes.forEach(register)` into `listen()`           |
| 4   | License mismatch: `MIT` file vs `ISC` in package.json        | legal metadata ambiguity                     | set `"license": "MIT"`                                    |
| 5   | Stale `jest.config.js` pattern `**/test-ai/**`               | noise; archived to `test-ai.old/`            | delete pattern                                            |
| 6   | Invoices never persisted                                     | fine for scope; blocks audit trail           | optional: `invoice` table + insert repository             |
| 7   | `moment` (legacy) in accrual strategy                        | maintenance mode lib                         | swap for `Temporal`/date-fns when convenient              |
| 8   | `.eslintrs.js` (invalid name) + duplicate lint-staged config | dead config confusion                        | remove stray file, keep `eslint.config.js`                |
| 9   | No authN/Z on `/invoice`                                     | anyone can trigger invoice emails            | add API key / JWT when leaving study mode                 |
| 10  | Loose CORS                                                   | defaults allow all origins                   | restrict via env-configured origin list                   |

## Hardening roadmap

1. **Now (docs-only):** everything above is documented; no code changed in this round.
2. **Short term:** debt items 1–5 (trivial diffs).
3. **If productionalized:** authN middleware + origin allow-list + rate limit; keep ADR-001 secret discipline; extend E2E to cover auth errors.

## Incident learnings

See [DEPLOYMENT-SAGA.md](../deploy/azure/history/DEPLOYMENT-SAGA.md) — 8 real issues (DNS propagation, Key Vault RBAC, ACA health probes, OIDC subject mismatch, …) with fixes; all mitigations now encoded in CI/CD workflows.

---

[← Architecture](ARCHITECTURE.md) · [ADR-001](../ADR-001-secrets-management.md) · [Docs Index](../INDEX.md)
