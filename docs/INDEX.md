# Documentation index

Use this page to choose the right project document. For Azure deployment, the
[manual guide](./deploy/azure/manual/step-by-step-guide.md) is the source of
truth.

## Start here

| Goal                                                  | Document                                                                     |
| ----------------------------------------------------- | ---------------------------------------------------------------------------- |
| Install, run, and understand the project              | [Project README](../README.md)                                               |
| Deploy or rebuild the current Azure learning stack    | [Azure manual deployment guide](./deploy/azure/manual/step-by-step-guide.md) |
| Get a concise Azure architecture and workflow summary | [Azure deployment overview](./deploy/azure/README.md)                        |
| Run API checks with Postman                           | [Postman guide](../postman/README.md)                                        |
| Review the technical design                           | [Deep analysis](./ANALISE-PROFUNDA.md)                                       |
| Read the management summary                           | [Executive report](./RELATORIO-EXECUTIVO.md)                                 |

## Current Azure learning stack

The current successful GitHub Actions target is exactly:

| Target                     | Canonical value                                     |
| -------------------------- | --------------------------------------------------- |
| Resource group             | `rg-tax-invoice-fc-learn`                           |
| Container Apps environment | `env-tax-invoice-fc-learn`                          |
| Container App              | `app-tax-invoice-fc-learn`                          |
| Image                      | `ghcr.io/samuel-ricardo/tax-invoice-issuer-fc:main` |

The workflow uses the GitHub `production` environment, Azure OIDC, the
`AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, and `AZURE_SUBSCRIPTION_ID` secrets,
`id-token: write`, and `containerAppEnvironment`. It passes the normalized
lowercase image output to the deploy action. The workflow does not run tests or
lint, and it deploys the `:main` tag rather than an immutable digest.

The manual guide covers the remaining runtime contract: private PostgreSQL
networking, schema initialization, Key Vault RBAC, managed identity, GHCR
credentials, verification, and troubleshooting.

## Azure document map

- [Manual deployment guide](./deploy/azure/manual/step-by-step-guide.md) —
  source of truth for the current `-learn` stack and workflow.
- [Azure deployment overview](./deploy/azure/README.md) — concise architecture,
  identity, registry, and limitation summary.
- [Historical architecture](./deploy/azure/ARCHITECTURE.md) — older diagrams and
  design notes; verify names against the manual guide.
- [Bicep setup guide](./deploy/azure/SETUP-GUIDE.md) — separate legacy/default
  IaC stack. Its defaults, including `rg-tax-invoice-fc`, `cae-tax-invoice-fc`,
  and `ca-tax-invoice-fc-api`, do not provision the current `-learn` workflow
  target.
- [Azure cost analysis](./deploy/azure/COST-ANALYSIS.md) — cost assumptions and
  savings options.

## API and testing resources

- [Quick-start testing guide](./QUICK-START-TESTS.md)
- [Postman collection guide](../postman/README.md)
- [Postman collection](../postman/Tax-Invoice-Issuer.postman_collection.json)
- [Local Postman environment](../postman/Tax-Invoice-Issuer.postman_environment.json)
- [Azure Postman environment](../postman/Tax-Invoice-Issuer-Azure.postman_environment.json)
  — contains a recorded URL; verify the current Container App **Application
  Url** before using it.

### Swagger status

The repository includes [`swagger.js`](../swagger.js), the
`npm run docs:swagger` generator, and the generated
[`docs/swagger.json`](./swagger.json). The application currently serves no
`/swagger`, `/api-docs`, or `/swagger.json` route, so `404` is expected. There is
also no `/health` route; use `GET /` for the HTTP smoke check.

## Project reference

- [Database migration](../migration/create.sql)
- [Security architecture review](./SECURITY-ARCHITECTURE-REVIEW.md)
- [Secrets-management ADR](./ADR-001-secrets-management.md)
- [Zod example](./zod-example.md)
- [Docker/WSL cleanup guide](./utils/docker/README.md)

**Last reviewed:** 2026-08-20
