# Testing

> Verified 2026-09-02: **34 `*.spec.ts` files** under `test/` (previously documented as 27 in older docs — the suite grew). Runner: **Jest 29 + ts-jest**, coverage via **v8** provider, HTTP assertions via **supertest**, mocks via **jest-mock-extended**.

## Layout

```text
test/
├── setup-env.ts            # loads env for all tests (jest setupFiles)
├── helpers/container.helper.ts   # builds an isolated Inversify container per test
├── E2E/                    # 5 suites, black-box through the HTTP adapter
│   ├── strategy.spec.ts    # cash vs accrual over HTTP
│   ├── server.spec.ts      # startup / health
│   ├── invoice.spec.ts     # POST /invoice happy + edge paths
│   ├── http.spec.ts        # HTTP-level contract (statuses, JSON envelope)
│   └── email.spec.ts       # invoice_generated → email pipeline (MailHog/simulated)
├── integration/
│   ├── invoice-service.spec.ts      # service + use-case + strategies + mocked repos
│   └── contract-strategy.spec.ts    # Contract entity ↔ strategy factory
├── unit/
│   ├── @modules/
│   │   ├── application/    # controllers (invoice, email), services, use-cases (18 specs)
│   │   ├── domain/         # entities, strategies, DTO guards (10 specs)
│   │   └── infra/          # engine + router (incl. tests inside src/@modules tree)
│   ├── @lib/ @decorators/  # logger/error decorators (5 specs)
│   └── @utils/ @types/     # load.utils, node-mediator.spec (2 specs)
├── @mock/                  # fixture factories: contract/list, invoice generate/edge/invalid/result, payment/list
├── @types/                 # "simulated" helper types for mocks (per layer)
└── utils/
```

## Running

```bash
npm test                 # full suite + coverage (jest.config.js: collectCoverage=true)
npm run test:coverage    # explicit coverage run
npm run test:dev         # quiet
npm run test:watch       # TDD loop
npm run test:infra       # setup:infra (compose) + suite — the infra-backed path
npm run code:ci          # lint + format + tests, mirrors CI
```

`jest.config.js` highlights: `preset: ts-jest`, `setupFiles: test/setup-env.ts`, `coverageProvider: v8`, `testTimeout: 10000`, and a stale pattern `**/test-ai/**/*.spec.ts` left from the archived `test-ai/` folder (harmless; archived to `test-ai.old/`).

## What is asserted (by layer)

| Layer       | Representative assertions                                                                                                                                                                                                             |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Domain      | `Contract.getBalance()`, `getAmountByPeriod()`; `CashBasisStrategy` returns invoice only when payment month/year match; `AccrualBasisStrategy` rolls UTC months and stops at the target period; factory rejects unknown strategy type |
| Application | `InvoiceServiceImpl` emits `invoice_generated`; controllers call `presenter.present`; `@Validate` blocks bad payloads; email controller consumes events                                                                               |
| Infra       | Express adapter registers routes; pg-promise adapter forwards `query(statement, params)`; nodemailer/puppeteer engines behind ports; `ExpressJsonPresenter` → `{ data }`                                                              |
| E2E         | `POST /invoice` returns seeded 2022 invoices; validation → 400 envelope; server boots on `PORT`; email arrives (MailHog/simulated transport)                                                                                          |

## Mocks & doubles

- `jest-mock-extended` (`mock<T>()`) for ports: repositories, mediator, engines.
- `test/@mock/**` — canonical fixtures (valid, invalid, edge-case invoice inputs; contract/payment lists).
- `test/helpers/container.helper.ts` — fresh DI container per test → no cross-test singletons.

## Coverage notes

`collectCoverageFrom` excludes: type-only files (`*.interface.ts`, `*.type.ts`, `@types/**`, DTOs), `server.ts`, and pure interface folders (domain repository/service/use-case, http.server, sql.connection) — so the reported number reflects executable code only. HTML report at `coverage/lcov-report/index.html` after `npm test`.

## Known gaps / debt (tracked)

| Item                                 | Status                                                                       |
| ------------------------------------ | ---------------------------------------------------------------------------- |
| Zod validation edge messages         | covered, but error-cause assertions could be stricter                        |
| `EmailController.start()` is a no-op | by design (event-driven)                                                     |
| Stale `testMatch` for `test-ai/`     | harmless, cleanup pending                                                    |
| E2E for `/docs` swagger              | blocked by redirect-loop bug (see [SECURITY.md](SECURITY.md#technical-debt)) |

---

[← Architecture](ARCHITECTURE.md) · [Quick Start Tests](../QUICK-START-TESTS.md) · [Docs Index](../INDEX.md)
