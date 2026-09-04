# 📚 Documentation Index

> **Central hub for all Tax Invoice Issuer documentation.** Start here to find the right document for your role and goal.

**Last updated:** 2026-09-02 · **Total documents:** 30+ · **Language:** English (all documents)

---

## 🧭 Choose your path

| I want to...                      | Go to                                                                                                         |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Understand the project quickly    | [README](../README.md) → [EXECUTIVE-REPORT.md](EXECUTIVE-REPORT.md)                                           |
| Set up the project locally        | [README § Quick Start](../README.md#rocket-quick-start) → [QUICK-START-TESTS.md](QUICK-START-TESTS.md)        |
| Study the architecture & patterns | [analysis/ARCHITECTURE.md](analysis/ARCHITECTURE.md) → [analysis/DEEP-ANALYSIS.md](analysis/DEEP-ANALYSIS.md) |
| Use the API                       | [analysis/API-REFERENCE.md](analysis/API-REFERENCE.md) → [postman/](../postman/README.md)                     |
| Understand the database           | [analysis/DATA-MODEL.md](analysis/DATA-MODEL.md)                                                              |
| Run/write tests                   | [QUICK-START-TESTS.md](QUICK-START-TESTS.md) → [analysis/TESTING.md](analysis/TESTING.md)                     |
| Review security posture           | [analysis/SECURITY.md](analysis/SECURITY.md) → [ADR-001](ADR-001-secrets-management.md)                       |
| Deploy to Azure                   | [deploy/azure/README.md](deploy/azure/README.md)                                                              |
| Reproduce the deployment          | [deploy/azure/manual/step-by-step-guide.md](deploy/azure/manual/step-by-step-guide.md)                        |
| Learn from incidents              | [deploy/azure/history/DEPLOYMENT-SAGA.md](deploy/azure/history/DEPLOYMENT-SAGA.md)                            |

---

## 📖 Deep Analysis (written 2026-09)

New consolidated technical documents — the fastest way to understand this codebase:

| Document                                          | Scope                                                      | Audience           |
| ------------------------------------------------- | ---------------------------------------------------------- | ------------------ |
| **[ARCHITECTURE.md](analysis/ARCHITECTURE.md)**   | Modules, layers, DI graph, 8 design patterns, data flow    | Architects, devs   |
| **[API-REFERENCE.md](analysis/API-REFERENCE.md)** | Endpoints, payloads, validation schemas, error format      | API consumers      |
| **[DATA-MODEL.md](analysis/DATA-MODEL.md)**       | `sam` schema, migrations, repositories, SQL                | Backend devs, DBAs |
| **[TESTING.md](analysis/TESTING.md)**             | 226 tests, 5 E2E suites, coverage, conventions             | Devs, QA           |
| **[SECURITY.md](analysis/SECURITY.md)**           | Consolidated audit, hardening roadmap, tech debt           | Security, leads    |
| **[DEEP-ANALYSIS.md](analysis/DEEP-ANALYSIS.md)** | Original line-by-line analysis (623 lines, now in English) | Deep divers        |

## 📊 Reports & History

| Document                                                               | Description                                                              |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **[EXECUTIVE-REPORT.md](EXECUTIVE-REPORT.md)**                         | Executive summary of the deep analysis (translated to English)           |
| **[DELIVERY-SUMMARY.md](DELIVERY-SUMMARY.md)**                         | Delivery artifacts and documentation checklist                           |
| **[VERIFICATION-COMPLETE-REPORT.md](VERIFICATION-COMPLETE-REPORT.md)** | Metric verification against source (versions, tests, coverage, patterns) |

---

## 🗂️ Full Document Catalog

### 🏠 Getting Started

1. **[README.md](../README.md)** — overview, quick start, scripts, API summary, troubleshooting
2. **[QUICK-START-TESTS.md](QUICK-START-TESTS.md)** — run the test suites (226 tests / 5 E2E suites)
3. **[zod-example.md](zod-example.md)** — Zod 4 validation patterns as used in this project (updated to Zod 4 APIs)

### ☁️ Azure Deployment

**Current stack** (Container Apps + OIDC + Key Vault):

4. **[deploy/azure/README.md](deploy/azure/README.md)** — hub: architecture, workflows, federated credentials
5. **[deploy/azure/ARCHITECTURE.md](deploy/azure/ARCHITECTURE.md)** — topology, resources, data flow (translated to English)
6. **[deploy/azure/COST-ANALYSIS.md](deploy/azure/COST-ANALYSIS.md)** — ~$15–54/month breakdown (translated)
7. **[deploy/azure/SETUP-GUIDE.md](deploy/azure/SETUP-GUIDE.md)** — setup walkthrough (translated)
8. **[deploy/azure/GITHUB-SECRETS-SETUP.md](deploy/azure/GITHUB-SECRETS-SETUP.md)** — required GitHub repo secrets

**Guides:**

9. **[deploy/azure/manual/step-by-step-guide.md](deploy/azure/manual/step-by-step-guide.md)** — reproducible provisioning (CLI + Portal), most-referenced doc
10. **[deploy/azure/manual/step-by-step-screenshots.md](deploy/azure/manual/step-by-step-screenshots.md)** — visual companion
11. **[deploy/azure/authentication/federated-credentials-guide.md](deploy/azure/authentication/federated-credentials-guide.md)** — OIDC / Workload Identity (no secrets!)
12. **[deploy/azure/communication-services-email.md](deploy/azure/communication-services-email.md)** — Azure Communication Services vs MailHog

**History:**

13. **[deploy/azure/history/DEPLOYMENT-SAGA.md](deploy/azure/history/DEPLOYMENT-SAGA.md)** — the 8 real issues hit & solved (DNS, Key Vault RBAC, ACA probes, OIDC subject mismatch...)

### 🔒 Security

14. **[../SECURITY-FIX-GUIDE.md](../SECURITY-FIX-GUIDE.md)** — remediation guide (translated to English)
15. **[../SECURITY-AUDIT-SUMMARY.md](../SECURITY-AUDIT-SUMMARY.md)** — audit summary (translated)
16. **[../SECURITY-AUDIT-FINAL-REPORT.md](../SECURITY-AUDIT-FINAL-REPORT.md)** — final audit report (translated)
17. **[SECURITY-ARCHITECTURE-REVIEW.md](SECURITY-ARCHITECTURE-REVIEW.md)** — architecture-level review
18. **[SECURITY-ARCHITECTURE-EXECUTIVE-SUMMARY.md](SECURITY-ARCHITECTURE-EXECUTIVE-SUMMARY.md)** — exec summary of the review
19. **[ADR-001: Secrets Management](ADR-001-secrets-management.md)** — decision record: env vars + `requiredSecret()` fail-fast

### 🔌 API & Integration

20. **[analysis/API-REFERENCE.md](analysis/API-REFERENCE.md)** — endpoints, payloads, error model
21. **[swagger.json](swagger.json)** — OpenAPI/Swagger spec (⚠️ `paths` intentionally empty — swagger-autogen parses only `server.ts`; use API-REFERENCE + Postman)
22. **[../postman/README.md](../postman/README.md)** — Postman guide: 23 requests, 6 folders, 2 environments
23. **[../postman/collections/Tax-Invoice-Issuer.postman_collection.json](../postman/collections/Tax-Invoice-Issuer.postman_collection.json)** — import file

### 🏗️ Legacy / Archived

24. **[../infra_public/README.md](../infra_public/README.md)** — ⚠️ legacy infra stack (Terraform/CLI, pre-ACA), kept for historical context (translated to English)
25. **[COMPLETED.md](COMPLETED.md)** — historical completion notes

---

## 🧪 Verification & Validation Documentation

| Category       | Documents                                                                                |
| -------------- | ---------------------------------------------------------------------------------------- |
| Test execution | [QUICK-START-TESTS.md](QUICK-START-TESTS.md), [analysis/TESTING.md](analysis/TESTING.md) |
| Coverage       | Run `npm test` → `coverage/lcov-report/index.html`                                       |
| E2E evidence   | Swagger UI (WIP) + Postman collection results                                            |
| CI checks      | `.github/workflows/` — lint, format, tests, docker build, cosign signing                 |

---

## 🔗 External Resources

| Resource       | Link                                                      |
| -------------- | --------------------------------------------------------- |
| Repository     | <https://github.com/Samuel-Ricardo/Tax-Invoice-Issuer-FC> |
| Full Cycle MBA | <https://fullcycle.com.br/>                               |
| Express 5 docs | <https://expressjs.com/en/5x/api.html>                    |
| Inversify      | <https://inversify.io/>                                   |
| Zod 4          | <https://zod.dev/>                                        |
| pg-promise     | <https://vitaly-t.github.io/pg-promise/>                  |

---

## 📝 Conventions

- **Language:** all documents are in **English** (translated 2026-09; historical reasons kept where relevant).
- **Diagrams:** Mermaid, embedded — no image binaries are used in docs.
- **Links:** relative to this file (`docs/INDEX.md`); root docs use `../`.
- **Renames (2026-09):** `ANALISE-PROFUNDA.md` → `analysis/DEEP-ANALYSIS.md` · `RELATORIO-EXECUTIVO.md` → `EXECUTIVE-REPORT.md` · `SUMARIO-ENTREGA.md` → `DELIVERY-SUMMARY.md`. All inbound links updated.
- **Outdated claims fixed globally:** Express is v5 (not 4), 226 tests (not "structure created"), scripts are the real ones from `package.json`, 8 documented design patterns.

> 🧭 **Lost?** Return to [README](../README.md) or use the "Choose your path" table at the top.
