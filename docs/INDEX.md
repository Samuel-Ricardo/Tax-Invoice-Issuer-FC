# Documentation index

> **Current source of truth — current as of 2026-08-25**
>
> The [Azure manual runbook](./deploy/azure/manual/step-by-step-guide.md) is the
> canonical operational document for the current learning deployment. The
> [Azure overview](./deploy/azure/README.md) and [Postman guide](../postman/README.md)
> are synchronized companions. Historical reports remain available but do not
> override the current runbook.

## Start here

| Goal                                               | Document                                                                     |
| -------------------------------------------------- | ---------------------------------------------------------------------------- |
| Install, run, and understand the project           | [Project README](../README.md)                                               |
| Deploy or rebuild the current Azure learning stack | [Azure manual deployment guide](./deploy/azure/manual/step-by-step-guide.md) |
| Get a concise Azure topology and workflow summary  | [Azure deployment overview](./deploy/azure/README.md)                        |
| Configure GitHub OIDC                              | [Federated credential guide](../azure-federated-credential-guide.md)         |
| Run API checks with Postman                        | [Postman guide](../postman/README.md)                                        |
| Review historical technical analysis               | [Deep analysis](./ANALISE-PROFUNDA.md)                                       |
| Read the historical management summary             | [Executive report](./RELATORIO-EXECUTIVO.md)                                 |

## Current Azure learning stack

| Target                     | Current value                                  |
| -------------------------- | ---------------------------------------------- |
| Repository                 | `Samuel-Ricardo/Tax-Invoice-Issuer-FC`         |
| Region                     | Brazil South                                   |
| Resource group             | `rg-tax-invoice-fc-learn`                      |
| Container Apps environment | `env-tax-invoice-fc-learn`                     |
| Container App              | `app-tax-invoice-fc-learn`                     |
| PostgreSQL Flexible Server | `psql-tax-invoice-fc-learn`                    |
| Key Vault                  | `kv-tax-invoice-fc-learn`                      |
| Log Analytics              | `law-tax-invoice-fc-learn`                     |
| GHCR image repository      | `ghcr.io/samuel-ricardo/tax-invoice-issuer-fc` |

The application VNet is `vnet-tax-invoice-fc` with subnet `default`. The database
VNet is `rg-tax-invoice-fc-learn-vnet` with subnet `default`. Bidirectional
peerings are `peer-to-db-vnet` and `peer-to-app-vnet`. The PostgreSQL private DNS
zone is `psql-tax-invoice-fc-learn.private.postgres.database.azure.com`, linked to
the application VNet as `link-app-vnet` with auto-registration disabled. This is
PostgreSQL Flexible Server private access/VNet integration, not a PostgreSQL
Private Endpoint topology.

## Current deployment flow

The committed workflow is
[`.github/workflows/docker-publish.yaml`](../.github/workflows/docker-publish.yaml).
For a push to `main`, it builds and publishes application and migration images,
validates immutable digests, logs into Azure through OIDC, validates and starts
the existing migration Job, waits for success, and only then deploys the app by
digest.

The GitHub `production` environment contains these secret names:

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`
- `GHCR_USERNAME`
- `GHCR_READ_TOKEN`

The repository variable `AZURE_MIGRATION_JOB_NAME` identifies the existing Manual
Container Apps migration Job. `GITHUB_TOKEN` publishes images during the workflow
but is not a durable runtime pull credential. Container Apps and the Job use the
durable GHCR credentials. The workflow does not use `AZURE_CREDENTIALS`.

The OIDC claims are:

```text
Subject:  repo:Samuel-Ricardo/Tax-Invoice-Issuer-FC:environment:production
Issuer:   https://token.actions.githubusercontent.com
Audience: api://AzureADTokenExchange
```

The OIDC identity has **Contributor** on `rg-tax-invoice-fc-learn`. The app's
system-assigned identity separately has **Key Vault Secrets User** on the Key
Vault.

## Migration truth

The ACA Job executes only `migration/create.sql` through
`Dockerfile.migrations` and `migration/runner.sh`, using `psql` with
`--single-transaction`. It intentionally drops `sam` with `CASCADE`, recreates the
schema/tables, creates `uuid-ossp` when needed, and seeds the 2022 fixture.
`migration/versions/` is not executed. **Every deployment resets and reseeds the
database.**

The database principal must connect to `<DATABASE_NAME>`, have `CONNECT` and the
required `CREATE`/schema administration privileges, and be able to drop and
recreate `sam`. The PostgreSQL Flexible Server `azure.extensions` allowlist must
include `uuid-ossp`. See the [migration section of the runbook](./deploy/azure/manual/step-by-step-guide.md#migration-behavior).

## API and QA facts

- `GET /` is the smoke test and must return HTTP `200` with `{"hello":"world"}`.
- `POST /invoice` requires `month`, `year`, and `type` (`cash` or `accrual`).
- `format` is optional. `format: "pdf"` is intentionally accepted as a no-op;
  no PDF implementation is required.
- Successful invoice responses are structured arrays serialized once, not escaped
  JSON strings. Runtime Postman checks must assert the parsed response is an
  array, including when empty. Commits `f1b551c` and `1927d73` record this state.
- A `cash` request for 2024 returning `[]` is inconclusive against the 2022 seed.
  The observed accrual path returned three invoices from the 2022 fixture.
- GitHub Actions passed, and deployment, migration, and database connectivity
  were verified from logs. The local E2E suite was blocked by missing local
  `DATABASE_URL`; it must not be described as passed.
- Some error paths can return HTTP `200` while the body reports `status: 500`.
  This is a known application response-contract limitation.

## Azure document map

- [Manual deployment guide](./deploy/azure/manual/step-by-step-guide.md) —
  canonical runbook, current topology, deployment gate, migration truth, API
  verification, and troubleshooting.
- [Azure deployment overview](./deploy/azure/README.md) — concise current summary.
- [Federated credential guide](../azure-federated-credential-guide.md) — OIDC
  subject, issuer, audience, and RBAC.
- [Postman guide](../postman/README.md) — current URL update and API expectations.
- [Legacy setup guide](./deploy/azure/SETUP-GUIDE.md) — historical/default Bicep
  instructions; not the current runbook.
- [Historical architecture](./deploy/azure/ARCHITECTURE.md) — retained context;
  not current deployment instructions.
- [Historical cost analysis](./deploy/azure/COST-ANALYSIS.md) — historical
  assumptions; verify current values separately.

`infra_public/` and its documentation are legacy/non-current for this learning
stack. Old names such as `rg-tax-invoice-fc`, `cae-tax-invoice-fc`,
`ca-tax-invoice-fc-api`, `psql-tax-invoice-fc`, `law-tax-invoice-fc`, and
`kv-tax-invoice-fc` must not be mixed with the current `-learn` resources.

## Project reference

- [Quick-start testing guide](./QUICK-START-TESTS.md) — historical/local testing
  notes; verify deployment facts against the current runbook.
- [Security architecture review](./SECURITY-ARCHITECTURE-REVIEW.md) — historical
  review; its metrics and findings are date-bound.
- [Secrets-management ADR](./ADR-001-secrets-management.md) — historical record;
  verify Azure claims against the current runbook.
- [Swagger generator output](./swagger.json)
- Docker/WSL cleanup guidance is not present in this checkout.

Never place a password, PAT, secret value, private request identifier, private IP,
or complete `DATABASE_URL` in documentation.
