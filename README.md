# :page_with_curl: Tax Invoice Issuer

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Node.js-25-339933?logo=node.js&logoColor=white" alt="Node.js 25">
  <img src="https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white" alt="Express 5">
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/tests-34%20spec%20files-brightgreen" alt="34 spec files">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License">
</p>

> **REST API that automates the issuance of tax invoices for long-term contracts, applying design patterns in a real enterprise scenario.**
>
> A contract with 48 installments generates 48 invoices — one per due period — each modeled as a financial transaction: date, payer, amount. Uses **Express 5** with decorator-based controllers, **Inversify** dependency injection, **pg-promise** over PostgreSQL, and **Zod 4** validation. Full test suite: **27 spec files, 226 test cases, 5 E2E suites**.

**Study Project** — [Full Cycle MBA](https://fullcycle.com.br/) · _As a tax invoice issuer, I want to automatically generate invoices for each contract due period so that billing obligations are met without manual work._

---

## :link: Documentation

**[Complete Documentation Hub :books:](docs/INDEX.md)** — organized index of all 30+ documents.

### Deep Analysis

| Document                                               | Description                                          |
| ------------------------------------------------------ | ---------------------------------------------------- |
| **[ARCHITECTURE.md](docs/analysis/ARCHITECTURE.md)**   | Modules, layers, 8 design patterns, data flow        |
| **[API-REFERENCE.md](docs/analysis/API-REFERENCE.md)** | Endpoints, payloads, validation, Postman collection  |
| **[DATA-MODEL.md](docs/analysis/DATA-MODEL.md)**       | PostgreSQL schema, migrations, repositories          |
| **[TESTING.md](docs/analysis/TESTING.md)**             | 226 tests, 5 E2E suites, coverage strategy           |
| **[SECURITY.md](docs/analysis/SECURITY.md)**           | Consolidated audit findings & hardening roadmap      |
| **[DEEP-ANALYSIS.md](docs/analysis/DEEP-ANALYSIS.md)** | Original line-by-line code analysis (now in English) |

### Reports & History

- **[EXECUTIVE-REPORT.md](docs/EXECUTIVE-REPORT.md)** — executive summary of the deep analysis
- **[DELIVERY-SUMMARY.md](docs/DELIVERY-SUMMARY.md)** — delivery artifacts and checklist

### Operations & Cloud

| Guide                                                                                        | Description                                                     |
| -------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| **[Azure Deployment Saga](docs/deploy/azure/history/DEPLOYMENT-SAGA.md)**                    | Real incident history of the Azure deployment (8 issues solved) |
| **[Azure Architecture](docs/deploy/azure/ARCHITECTURE.md)**                                  | Azure topology (ACA, ACR, Key Vault, PostgreSQL Flexible)       |
| **[Step-by-Step Guide](docs/deploy/azure/manual/step-by-step-guide.md)**                     | Reproducible cloud provisioning walkthrough                     |
| **[Federated Credentials](docs/deploy/azure/authentication/federated-credentials-guide.md)** | Keyless auth: OIDC + Workload Identity                          |
| **[Quick Start - Tests](docs/QUICK-START-TESTS.md)**                                         | How to run the test suites                                      |
| **[Zod Examples](docs/zod-example.md)**                                                      | Zod 4 validation patterns used in this project                  |
| **[Postman Docs](postman/)**                                                                 | API collection (23 requests, 6 folders, 2 environments)         |
| **[Email Integration](docs/deploy/azure/communication-services-email.md)**                   | Azure Communication Services + MailHog                          |

### Postman

| Artifact       | Link                                                                                                                             |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Collection** | [postman/collections/Tax-Invoice-Issuer.postman_collection.json](postman/collections/Tax-Invoice-Issuer.postman_collection.json) |
| **Guide**      | [postman/README.md](postman/README.md)                                                                                           |
| **Docs index** | [docs/INDEX.md](docs/INDEX.md)                                                                                                   |

> **Run online:** [![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/)

---

## :rocket: Quick Start

### Prerequisites

- **Node.js 25** (project uses a Current release; an LTS such as 20/22 also works)
- **PostgreSQL 14+** (or Docker)
- npm 10+

### Option A — Local with Docker Compose (recommended)

```bash
git clone https://github.com/Samuel-Ricardo/Tax-Invoice-Issuer-FC.git
cd Tax-Invoice-Issuer-FC
npm install
cp .env.example .env        # then edit .env (see table below)
```

`.env` — minimum configuration:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
EMAIL_HOST=localhost          # MailHog in docker-compose
EMAIL_PORT=1025
```

> :warning: **Destructive migrations** — `migration/create.sql` **drops and recreates** the `sam` schema and inserts sample data. Never point this at a database you care about.

```bash
docker compose up -d        # postgres + migrations + pgadmin + mailhog + tcp-knock
npm run start:dev           # http://localhost:3000
```

### Option B — Fully containerized app

```bash
docker compose --profile app up -d
```

The app container connects to the `postgres` service host — inside compose, use `DATABASE_URL=postgresql://postgres:postgres@postgres:5432/postgres`.

### Interfaces

| Service    | URL                          | Purpose                                                                    |
| ---------- | ---------------------------- | -------------------------------------------------------------------------- |
| API        | <http://localhost:3000>      | REST endpoints                                                             |
| Swagger UI | <http://localhost:3000/docs> | Auto-generated docs (**known issue**: redirect loop — see Troubleshooting) |
| pgAdmin    | <http://localhost:8080>      | DB admin UI                                                                |
| MailHog    | <http://localhost:8025>      | Captures outgoing invoice emails                                           |

### Health checks

```bash
curl http://localhost:3000/               # {"hello":"world"}
docker exec -it postgres pg_isready -U postgres
```

---

## :whale: Docker Environment

Full development environment with a single command:

| Container      | Image                       | Port        | Purpose                                             |
| -------------- | --------------------------- | ----------- | --------------------------------------------------- |
| **app**        | `Dockerfile` (node:25-slim) | 3000        | Express 5 API (profile `app`, off by default)       |
| **postgres**   | postgres:16                 | 5432        | Database                                            |
| **migrations** | `Dockerfile.migrations`     | —           | One-shot: executes `migration/create.sql`           |
| **pgadmin**    | dpage/pgadmin4              | 8080        | DB admin UI                                         |
| **mailhog**    | mailhog/mailhog             | 1025 / 8025 | SMTP capture + web UI                               |
| **tcp-knock**  | `Dockerfile.knock`          | 7000        | Simulated TCP endpoint (learning/port-knocking lab) |

```bash
docker compose up -d                  # everything except the app container
docker compose --profile app up -d    # including the app container
docker compose logs -f migrations     # watch schema bootstrap
```

> **Cost:** local Docker is free. The cloud deployment on Azure (Container Apps, PostgreSQL Flexible, Key Vault, ACR, Static Web App) is sized at **~$15–54/month** — see [COST-ANALYSIS.md](docs/deploy/azure/COST-ANALYSIS.md).

---

## :world_map: Architecture Overview

```mermaid
flowchart LR
    Client([Client / Postman]) -->|HTTP| Express[Express 5 adapter]
    Express --> Ctrl[InvoiceController]
    Ctrl -->|@Validate| Zod[Zod Specification]
    Ctrl --> Service[InvoiceService]
    Service --> UC[GenerateInvoiceUseCase]
    UC --> Repo[(Repositories<br/>pg-promise)]
    Repo --> PG[(PostgreSQL · sam.contract<br/>sam.payment)]
    UC --> Strategy{InvoiceStrategy}
    Strategy -->|cash| Cash[CashBasisStrategy]
    Strategy -->|accrual| Accrual[AccrualBasisStrategy]
    Service -->|emit invoice_generated| Mediator[Mediator]
    Mediator --> EmailCtrl[EmailController]
    EmailCtrl --> Router[Email Router]
    Router -->|SMTP| Nodemailer[Nodemailer → MailHog]
    Router -->|PDF| Puppeteer[Puppeteer → HTML/PDF]
```

**Layers:** HTTP adapter → controller (decorators: `@Validate`, `@DataLogger`, `@ErrorHandler`) → service → use case → entities & strategies → repositories (read-only `SELECT`s) → PostgreSQL. Side effects fan out through a **Mediator** event (`invoice_generated`) to the email pipeline (nodemailer → MailHog, puppeteer for PDF). Everything is wired with Inversify DI and the typed `MODULE` registry — never a static `new`.

> Deep dive: [ARCHITECTURE.md](docs/analysis/ARCHITECTURE.md) · [DATA-MODEL.md](docs/analysis/DATA-MODEL.md)

---

## :electric_plug: API

| Method | Endpoint   | Description                                                                                                                           | Validation   |
| ------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| `GET`  | `/`        | Health check — returns `{ "hello": "world" }`                                                                                         | —            |
| `POST` | `/invoice` | Generate invoices for a given month/year using a cash-basis or accrual-basis strategy; emits an internal event that emails the result | Zod 4 schema |

**Request** (`POST /invoice`):

```json
{ "month": 1, "year": 2022, "type": "cash" }
```

| Field   | Type                  | Rule                            |
| ------- | --------------------- | ------------------------------- |
| `month` | integer               | 1–12                            |
| `year`  | integer               | e.g. 2022                       |
| `type`  | `"cash" \| "accrual"` | selects the generation strategy |

**Success** (`200`) — structured by the JSON presenter:

```json
{ "data": [{ "date": "2022-01-05T10:00:00.000Z", "amount": 6000 }] }
```

**Validation error** (`400`) — thrown as `ValidationDataError` from the Zod issues:

```json
{
  "status": 400,
  "error": true,
  "message": "...",
  "cause": [{ "path": ["month"], "message": "..." }]
}
```

> **Try it:** first run the migrations (they seed one contract of R$ 6.000 in 12 periods starting 2022-01, plus one payment on 2022-01-05), then POST `{ "month": 1, "year": 2022, "type": "cash" }` and check MailHog at <http://localhost:8025> for the invoice email.

---

## :test_tube: Testing

**34 spec files across unit, integration and E2E layers · 5 E2E suites** — Jest 29 + ts-jest + supertest + jest-mock-extended.

```bash
npm test                 # full suite with coverage report
npm run test:coverage    # same, explicitly opening coverage config
npm run test:dev         # --silent (quiet)
npm run test:watch       # watch mode
npm run test:infra       # setup:infra + jest (infra-backed tests)
```

| Area                                     | Specs | Focus                                        |
| ---------------------------------------- | ----- | -------------------------------------------- |
| Domain (entities, strategies, use-cases) | 10    | Cash/accrual generation, balance, strategies |
| Controllers                              | 2     | Invoice + Email flows with mocked deps       |
| Repositories                             | 2     | SQL parameterization ($1 placeholders)       |
| Router / mediator / engines              | 5     | EmailRouter, mediator, sanitizer, adapters   |
| Integration                              | 2     | invoice-service, contract-strategy           |
| E2E                                      | 5     | strategy, server, invoice, http, email       |

> Spec sources: `test/unit`, `test/integration`, `test/E2E` (+ mocks in `test/@mock`, simulated types in `test/@types`).

> Details: [TESTING.md](docs/analysis/TESTING.md) · [QUICK-START-TESTS.md](docs/QUICK-START-TESTS.md)

---

## :hammer_and_wrench: Tech Stack

| Layer            | Technology                           | Version                                         |
| ---------------- | ------------------------------------ | ----------------------------------------------- |
| Runtime          | Node.js                              | 25 (Current, non-LTS)                           |
| Language         | TypeScript                           | 5.9.3 — strict decorators + ESM-friendly config |
| Web framework    | Express                              | 5.2.1                                           |
| DI / IoC         | Inversify                            | 7.11.0                                          |
| Database driver  | pg-promise                           | 12.6.0 (raw parameterized SQL)                  |
| Validation       | Zod                                  | 4.3.6                                           |
| Containerization | Docker + compose                     | node:25-slim base                               |
| Tests            | Jest + ts-jest + supertest           | 29.7                                            |
| API docs         | swagger-autogen + swagger-ui-express | UI mount pending                                |
| CI/CD            | GitHub Actions + Azure               | OIDC keyless, cosign image signing              |

> **Not used (legacy dependency):** Prisma is listed in `package.json` but has **no schema, no client, zero references in source** — the data layer is 100% pg-promise + raw SQL. The `npm run db:sync` script is dead. Removal tracked as debt ([SECURITY.md](docs/analysis/SECURITY.md#technical-debt)).

---

## :jigsaw: Design Patterns

This project exists to exercise patterns **in production-shaped code**. Ten are identifiable in `src/`:

| #   | Pattern                  | Where                                                               |
| --- | ------------------------ | ------------------------------------------------------------------- |
| 1   | **Dependency Injection** | Inversify container + `@inject(MODULE...)` everywhere               |
| 2   | **Registry**             | `MODULE` (typed tokens) in `src/@modules/**/ *.registry.ts`         |
| 3   | **Factory**              | `factory/` folders per module + `InvoiceGenerationStrategyFactory`  |
| 4   | **Strategy**             | Invoice generation: `CashBasisStrategy` vs `AccrualBasisStrategy`   |
| 5   | **Repository**           | `ContractRepositorySQL`, `PaymentRepositorySQL` abstract pg-promise |
| 6   | **Decorator (metadata)** | `@Validate`, `@DataLogger`, `@ErrorHandler` (reflect-metadata)      |
| 7   | **Adapter**              | Engine wrappers: Express 5, pg-promise, nodemailer, puppeteer       |
| 8   | **Observer / Mediator**  | `Mediator` + `EVENTS` config decouple invoice generation from email |
| 9   | **Facade**               | `AppFactory`, `EmailRouter` (smtp → nodemailer, pdf → puppeteer)    |
| 10  | **Singleton**            | Inversify singleton scope (container, engines)                      |

> Older docs claimed "7" or "8" patterns — the enumeration above is the verified current state. Full evidence table: [ARCHITECTURE.md](docs/analysis/ARCHITECTURE.md#design-patterns).

---

## :file_folder: Project Structure

```text
Tax-Invoice-Issuer-FC/
├── src/
│   ├── @modules/           # Feature modules (Inversify composition)
│   │   ├── app/            # app.module / app.factory / app.registry
│   │   ├── domain/         # Entities & business rules
│   │   ├── application/    # Controllers, services, repositories, factories
│   │   └── infra/          # engine (db), validator (zod), config (env)
│   ├── @types/             # strategy & shared types
│   ├── @lib/               # logger, decorators
│   ├── server.ts           # HTTP bootstrap (port from env, default 3000)
│   └── app.ts              # Express app assembly
├── migration/              # Raw SQL (schema sam) + runner.sh + Dockerfile
├── test/                   # Jest (unit + E2E + mocks)
├── docs/                   # Documentation hub (see docs/INDEX.md)
│   └── analysis/           # ARCHITECTURE · API · DATA · TESTING · SECURITY
├── postman/                # Collection + environments
├── infra_public/           # :warning: legacy infra docs (archived)
├── .github/workflows/      # CI/CD (Azure OIDC, cosign, GHCR)
├── docker-compose.yaml     # postgres + migrations + pgadmin + mailhog + knock
├── Dockerfile              # node:25-slim production image
├── jest.config.js          # ts-jest, v8 coverage
└── package.json
```

---

## :scroll: NPM Scripts

| Script                          | Command                                   | Notes                                 |
| ------------------------------- | ----------------------------------------- | ------------------------------------- |
| `npm run build`                 | `tsc -p .`                                | Emit to `dist/`                       |
| `npm start`                     | `docs:swagger && node dist/src/server.js` | Requires `build` first                |
| `npm run start:dev`             | `ts-node src/server.ts`                   | Dev without build                     |
| `npm test`                      | `jest`                                    | 226 tests + coverage                  |
| `npm run test:watch`            | `jest --watch`                            | TDD loop                              |
| `npm run code:ci`               | lint + format check + tests               | Mirrors CI pipeline                   |
| `npm run lint` / `lint:fix`     | eslint                                    | Flat config (`eslint.config.js`)      |
| `npm run format` / `format:fix` | prettier                                  | 100-col, single quotes                |
| `npm run docs:swagger`          | `node swagger.js`                         | Regenerates `docs/swagger.json`       |
| `npm run db:sync`               | —                                         | :warning: **dead** (no Prisma in use) |

> Older docs mention `dev`, `test:e2e`, `format:check` — those scripts **do not exist**; see the table above (fixed everywhere in this documentation round).

---

## :closed_lock_with_key: Security

- **Zod 4 validation** on all write endpoints — rejects malformed payloads before business logic.
- **Secrets**: `DATABASE_URL` read via `requiredSecret()` — app fails fast at startup if missing; nothing hardcoded.
- **Parameterized SQL** everywhere (`$1, $2` placeholders via pg-promise) — no string concatenation.
- **Keyless cloud auth**: GitHub Actions → Azure via OIDC federated credentials; container images signed with **cosign**.
- **No authentication on endpoints** — acceptable for a study project; production hardening roadmap in the security docs.

Full posture, audit history and debt tracker: [SECURITY.md](docs/analysis/SECURITY.md) · [ADR-001: Secrets Management](docs/ADR-001-secrets-management.md)

---

## :cloud: Cloud (Azure)

Production-shaped deployment on **Azure Container Apps** with ACR, Key Vault, PostgreSQL Flexible Server and a Static Web App dummy frontend. Infrastructure docs and the full incident history (8 real issues solved: DNS, Key Vault RBAC, ACA health probes, OIDC subject mismatch...) live in [docs/deploy/azure/](docs/deploy/azure/README.md).

- **Estimated cost**: ~$15–54/month ([COST-ANALYSIS.md](docs/deploy/azure/COST-ANALYSIS.md))
- **Provisioning**: [step-by-step-guide.md](docs/deploy/azure/manual/step-by-step-guide.md)
- **Legacy reference**: `infra_public/` (archived — kept for historical context)

---

## :bug: Troubleshooting

| Symptom                     | Cause                                                   | Fix                                                                                                                 |
| --------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `/docs` redirect loop       | `swagger-ui-express` 5.x + Express 5 serving `""` route | Use `docs/swagger.json` directly or Postman; fix tracked in [SECURITY.md](docs/analysis/SECURITY.md#technical-debt) |
| `SecretError: DATABASE_URL` | `.env` missing/misnamed                                 | `cp .env.example .env`, set `DATABASE_URL`                                                                          |
| Migration wipes data        | `create.sql` is destructive **by design**               | Expected — dev-only flow; see [DATA-MODEL.md](docs/analysis/DATA-MODEL.md)                                          |
| `npm run db:sync` fails     | No Prisma schema (dead script)                          | Data layer is pg-promise; ignore/remove script                                                                      |
| Port 3000 busy              | Another process bound                                   | `PORT=3001 npm run start:dev`                                                                                       |

---

## :bust_in_silhouette: Author

**Samuel Ricardo** — [GitHub](https://github.com/Samuel-Ricardo) · [LinkedIn](https://www.linkedin.com/in/samuel-ricardo/)

Built as a study project for the **Full Cycle MBA** — design patterns applied to a realistic billing domain.

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License"></a>
</p>

> **License:** [MIT](LICENSE) — see `LICENSE` file. (`package.json` still declares `ISC`; metadata inconsistency tracked in [SECURITY.md](docs/analysis/SECURITY.md#technical-debt).)
