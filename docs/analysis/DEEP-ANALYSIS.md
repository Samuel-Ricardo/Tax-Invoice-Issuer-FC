# 🔍 Deep Analysis — Tax Invoice Issuer FC

> **Historical analysis — not the current deployment runbook.** This document preserves the June 2026 analysis, metrics, and findings. For the current Azure topology, workflow, migration behavior, API response shape, and QA evidence, use the [current Azure runbook](../deploy/azure/manual/step-by-step-guide.md), the [Azure overview](../deploy/azure/README.md), and the [documentation index](../INDEX.md).
>
> **Translation note (2026-09-02):** translated from `ANALISE-PROFUNDA.md` (PT-BR) during the English documentation consolidation.

---

## 1. Executive Summary

The **Tax Invoice Issuer** is a study project (Full Cycle MBA) implementing a small but production-shaped API: given contracts and their registered payments in PostgreSQL, the API generates the invoices due up to a given month/year, optionally formats/e-mails them, and returns a structured summary.

The codebase demonstrates **deliberate practice of design patterns** — the point of the project is density of patterns in a realistic enterprise shape, not business breadth.

### Vitals

| Item           | Value                                                                                                           |
| -------------- | --------------------------------------------------------------------------------------------------------------- |
| Language       | TypeScript 5.9.3 (Node 25, Current)                                                                             |
| HTTP framework | Express 5.2.1                                                                                                   |
| DI container   | Inversify 7.10.3                                                                                                |
| Validation     | Zod 4.3.6 (via `@Validate` specification decorator)                                                             |
| Persistence    | pg-promise 12.6.0 over PostgreSQL (raw SQL, parameterized)                                                      |
| ORM            | **None** — `prisma` is a declared-but-unused dependency                                                         |
| Tests          | Jest 30.2.+ ts-jest + supertest — 34 spec files / 226 tests                                                     |
| DevOps         | Docker multi-stage (`node:25-slim`), GitHub Actions → GHCR → Azure Container Apps (OIDC keyless, cosign-signed) |

### Verdict

A well-organized, pattern-rich learning codebase with above-average structural hygiene. Main gaps: business-logic edge cases during invoice generation (see §6), validation coverage of value ranges, and a few infra quirks documented in [SECURITY.md](./SECURITY.md).

---

## 2. Architecture Analysis

### 2.1 Layered topology

```text
HTTP  →  ExpressServerEngine (infra adapter)
        →  Router (infra)
        →  Controller (application)         @Validate → Zod specification
        →  Service (application)            orchestration + event emission
        →  Use Case (application)           one business action each
        →  Strategy (domain)                Cash | Accrual generation
        →  Repository (application→sql)     pg-promise, parameterized SQL
        →  PostgreSQL (schema sam)
```

Every arrow crosses an **interface owned by the consumer layer** (ports & adapters). The DI container (Inversify) wires implementations at composition time in `src/server.ts`.

### 2.2 Structural directories

| Directory                              | Role                                                                             |
| -------------------------------------- | -------------------------------------------------------------------------------- |
| `src/@modules/infra/`                  | engines (HTTP server, pg-promise, nodemailer, puppeteer), validators, presenters |
| `src/@modules/app/`                    | controllers, services, use-cases                                                 |
| `src/@modules/domain/`                 | entities (`Contract`, `Invoice`, `Payment`), strategies, events                  |
| `src/@modules/application/repository/` | SQL repositories                                                                 |
| `src/@decorators/`                     | cross-cutting decorators (`@Validate`, `@DataLogger`, `@ErrorHandler`)           |
| `src/config/`, `src/types/`            | env loading, shared types                                                        |
| `migration/`                           | raw SQL migrations + runner (`create.sql` is **destructive** by design)          |
| `test/`                                | unit + integration + E2E + `@mock/` factories                                    |

### 2.3 Boot sequence

1. `src/server.ts` builds the Inversify container (registries per module).
2. Express engine attaches routes from metadata.
3. Middleware estate: JSON body parsing, CORS, error handler.
4. Server listens on `PORT` (env) — default observed in compose: `3000`.

---

## 3. Design Patterns Identified

The original analysis documented **8 patterns**; a closer reading identifies **10**:

| #   | Pattern                  | Where (evidence)                                                                                                     |
| --- | ------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| 1   | **Strategy**             | `domain/strategy/` — `CashStrategy` vs `AccrualStrategy` decide how invoices are computed from contract/payment data |
| 2   | **Factory**              | `*-factory` modules (e.g., invoice generation factory) selecting strategy/implementation at runtime                  |
| 3   | **Repository**           | `application/repository/*` — `ContractRepository`, `PaymentRepository` abstracts pg-promise                          |
| 4   | **Dependency Injection** | Inversify container + `@injectable()` throughout                                                                     |
| 5   | **Decorator (metadata)** | `@Validate(spec)`, `@DataLogger`, `@ErrorHandler` applied to controller methods                                      |
| 6   | **Specification**        | Zod schemas wrapped as specifications and injected into `@Validate`                                                  |
| 7   | **Singleton**            | Inversify default scope + single pg-promise connection                                                               |
| 8   | **Presenter**            | `JsonPresenter` shapes the HTTP response envelope                                                                    |
| 9   | **Observer / Mediator**  | event-driven side effects (e-mail notification on invoice-generated)                                                 |
| 10  | **Adapter**              | engine wrappers isolating Express / pg-promise / nodemailer / puppeteer                                              |

> Older docs alternately claimed 7 or 8 patterns; that was **documentation drift**, not code change. The enumeration above is the current, verified state (see [ARCHITECTURE.md](./ARCHITECTURE.md)).

---

## 4. Request-Flow Analysis

### 4.1 Endpoints

| Method | Route      | Purpose                                                                                    |
| ------ | ---------- | ------------------------------------------------------------------------------------------ |
| `GET`  | `/`        | sanity/liveness — returns `{ "hello": "world" }`                                           |
| `POST` | `/invoice` | generate invoices (body: `InvoiceDTO { month, year, type: "cash" \| "accrual", format? }`) |

There is **no** `/contracts` route and no `/hello` route — earlier docs listed phantom endpoints; corrected here and in the README.

### 4.2 `POST /invoice` pipeline

1. Router matches `/invoice` → controller method with decorator chain `@ErrorHandler → @DataLogger → @Validate(InvoiceSpec)`.
2. Zod validates `month` (number/int), `year` (number/int), `type ∈ {cash, accrual}`. **Gap:** no range bounds (`month=0/13` passes silently) — see §6.
3. Service orchestrates: fetch contracts + payments via repositories → feed each contract to the selected strategy.
4. **Cash**: invoices only where an actual payment matches month/year.
5. **Accrual**: one invoice per elapsed period (`amount / periods` each), up to the requested month — uses `moment` for date math.
6. Result wrapped by presenter: `{ data: [...] }` on success; failures raise typed `AppError`s → 400 (validation) or 500 envelopes.

### 4.3 Side effects

Invoice generation emits a domain event → e-mail notification (nodemailer → MailHog in dev and the compose stack; Azure Communication Services is documented for cloud). The e-mail controller validates its payload with a Zod specification as well. Puppeteer is wired as a PDF engine for invoice rendering paths.

---

## 5. Database Perspective

### 5.1 Schema `sam`

```sql
CREATE TABLE sam.contract (
  id_contract UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  description TEXT, amount NUMERIC, periods INTEGER, date TIMESTAMP
);
CREATE TABLE sam.payment (
  id_payment UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_contract UUID REFERENCES sam.contract(id_contract),
  amount NUMERIC, date TIMESTAMP
);
```

Relationship: `Contract (1) ←→ (N) Payment`. Extension required: `uuid-ossp`.

### 5.2 Migrations

| Artifact               | Notes                                                                                                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `migration/create.sql` | **DESTRUCTIVE** — drops and recreates the `sam` schema, then seeds fixtures. Applied by the migration runner container on every deploy (intentional, learning-oriented). |
| `migration/runner.sh`  | POSIX shell runner executed by the `Dockerfile.migrations` image                                                                                                         |
| `npm run db:sync`      | **dead script** — references Prisma, which is not actually used                                                                                                          |

### 5.3 Access pattern

Repositories use pg-promise with parameterized statements (`$1`, `$2`); no string-concatenated SQL exists in the repositories reviewed — injection risk is low at this layer. Repositories are **read-oriented** (list/query) — inserts happen through migrations/seeds in the studied flows.

### 5.4 Seed data

The composed Postgres starts with sample contract(s)/payment(s) enabling immediate E2E runs (`test/E2E/invoice.spec.ts` expects the seeded contract).

---

## 6. Bug / Finding Register

Severity-ordered findings from the June 2026 analysis, reconciled with the Sep 2026 verification:

### 🔴 Critical

| #   | Finding                                                                                                                                                                                                  | Status                                   |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| 1   | **Inverted Strategy selection** — historical report suggested accrual/cash selection mismatch in `catalog.strategy.ts`; re-verification shows the observable symptom was filtered out by a presenter fix | ⚠️ watch-listed                          |
| 2   | **DI teardown** — container not disposed between some E2E runs                                                                                                                                           | ✅ FIXED (CONTROLLER_CONTAINER teardown) |

### 🟡 Medium

| #   | Finding                                                                      | Status                                                                                                     |
| --- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 3   | Missing range validation (`month` accepts 0/13/−1; year unbounded)           | ⚠️ PENDING                                                                                                 |
| 4   | HTTP status mapping — several internal errors reported in body with HTTP 200 | ⚠️ ACCEPTED (documented behavior)                                                                          |
| 5   | `console.log` noise in `cash.strategy.ts`                                    | ⚠️ PENDING                                                                                                 |
| 6   | Double JSON encoding of payloads                                             | ✅ RESOLVED — presenter returns structured objects; Express serializes once (commits `f1b551c`, `1927d73`) |

### 🟢 Minor

| #   | Finding                                                                           | Status     |
| --- | --------------------------------------------------------------------------------- | ---------- |
| 8   | Empty `docs/swagger.json` (`paths: {}`) — swagger-autogen parses only `server.ts` | ⚠️ PENDING |
| 9   | `/docs` route: swagger-ui redirect loop under Express 5                           | ⚠️ PENDING |
| 10  | `moment` is legacy; prefer `date-fns`/luxon/`Temporal`                            | ℹ️ backlog |
| 11  | `strict: true` not enabled in tsconfig                                            | ℹ️ backlog |

The consolidated debt list lives in [SECURITY.md](./SECURITY.md#technical-debt).

---

## 7. Security Considerations

| Category         | Risk   | Posture                                                |
| ---------------- | ------ | ------------------------------------------------------ |
| SQL Injection    | Low    | parameterized queries throughout (`$1`, `$2`)          |
| Input validation | Medium | Zod type validation present; missing range bounds      |
| Error disclosure | Medium | internal messages can reach the client body            |
| DoS              | High   | no rate limiting, no payload cap, no timeout hardening |
| CORS             | Low    | permissive by default in dev                           |
| XSS              | Low    | JSON-only API                                          |

Recommendations (unchanged, still valid): add `express-rate-limit`, `helmet`, and `express.json({ limit: '10kb' })`; sanitize error messages in production.

For the full audit trail see the root `SECURITY-*` documents and [SECURITY.md](./SECURITY.md).

---

## 8. Test Coverage

### Current metrics (re-verified 2026-09)

| Metric             | June-2026 claim | Verified 2026-09                                         |
| ------------------ | --------------- | -------------------------------------------------------- |
| Spec files         | 27              | **34**                                                   |
| Tests              | 226             | **226**                                                  |
| E2E suites         | 2               | **5** (`server`, `invoice`, `strategy`, `http`, `email`) |
| Statement coverage | 74%             | ~34.7% overall (domain ≈100%, infra <20%)                |

> The 74%/94% figures circulated in older documents were targets/regional numbers, not the project-wide measured value. Ground truth: run `npm test` (Jest prints global coverage).

### E2E suites

| File                        | Scope                                        |
| --------------------------- | -------------------------------------------- |
| `test/E2E/server.spec.ts`   | boot + `GET /` health                        |
| `test/E2E/invoice.spec.ts`  | `POST /invoice` happy path + format variants |
| `test/E2E/strategy.spec.ts` | cash vs accrual matrix                       |
| `test/E2E/http.spec.ts`     | HTTP envelope/headers/status semantics       |
| `test/E2E/email.spec.ts`    | e-mail notification flow (MailHog)           |

### Gaps still open (from June analysis, still partially valid)

- Unit tests for strategies edge windows (month rollover, February)
- Validator negative-matrix (invalid month/year/message content)
- Repository integration tests against rollbacked fixtures

---

## 9. Infrastructure & DevOps

| Component      | State                                                                                                                                            |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Dockerfile     | multi-stage, `node:25-slim` production stage                                                                                                     |
| docker-compose | app + postgres + pgadmin + mailhog + migrations runner                                                                                           |
| CI/CD          | GitHub Actions: lint → test → build → cosign-sign → GHCR → Azure Container Apps deploy via **OIDC (keyless)**; migration gate runs before deploy |
| IaC history    | earlier Terraform/legacy material preserved in `infra_public/`                                                                                   |

Details: [../deploy/azure/README.md](../deploy/azure/README.md), [../deploy/azure/history/DEPLOYMENT-SAGA.md](../deploy/azure/history/DEPLOYMENT-SAGA.md).

---

## 10. Quality Tooling

| Tool                | Config                        | Status                                                      |
| ------------------- | ----------------------------- | ----------------------------------------------------------- |
| ESLint              | `eslint.config.js` (flat, v9) | ✅ active; legacy stray file noted in debt list             |
| Prettier            | `.prettierrc*`                | ✅ `printWidth: 100`, single quotes, `trailingComma: 'all'` |
| Husky + lint-staged | pre-commit                    | ✅ formats staged md/json/ts                                |
| TypeScript          | `tsconfig.json`               | ⚠️ `strict` disabled — enabling is backlog                  |

---

## 11. Recommendations (prioritized)

| Priority | Action                                                                  | Effort  |
| -------- | ----------------------------------------------------------------------- | ------- |
| P1       | Add range validation to `InvoiceDTO` (`month 1-12`, sane `year` bounds) | 30 min  |
| P1       | Remove dead `prisma` dep + `db:sync` script                             | 5 min   |
| P2       | Populate swagger docs or remove the UI mount (fix `/docs` loop)         | 1-2 h   |
| P2       | Map internal errors to real HTTP statuses (keep envelope, set status)   | 1 h     |
| P2       | Coverage floor: raise infra layer ≥ 60%                                 | ongoing |
| P3       | Replace `moment` with `date-fns`/`Temporal`                             | ½ day   |
| P3       | Enable `strict` TypeScript                                              | ½ day   |

---

## 12. Conclusion

Tax Invoice Issuer achieves its goal: it is a compact but credible showcase of enterprise patterns (10 identifiable) applied to a concrete domain (invoice emission over contracts/payments). The September 2026 consolidation corrected stale metric claims, phantom endpoints, and translation gaps — everything above is verified against source.

**Historical artifacts preserved; no content was deleted during the consolidation — only renamed, translated, and corrected.**

---

_Last updated: 2026-09-02 (English consolidation). Document version: 2.1._
