# Documentation index

Use this page to choose the right project document. For Azure deployment, the
[manual guide](./deploy/azure/manual/step-by-step-guide.md) is the primary source
of truth.

## Start here

| Goal                                                  | Document                                                                     |
| ----------------------------------------------------- | ---------------------------------------------------------------------------- |
| Install, run, and understand the project              | [Project README](../README.md)                                               |
| Deploy or rebuild the current Azure learning stack    | [Azure manual deployment guide](./deploy/azure/manual/step-by-step-guide.md) |
| Get a concise Azure architecture and workflow summary | [Azure deployment overview](./deploy/azure/README.md)                        |
| Configure GitHub OIDC for the deployment              | [Federated credential guide](../azure-federated-credential-guide.md)         |
| Run API checks with Postman                           | [Postman guide](../postman/README.md)                                        |
| Review the technical design                           | [Deep analysis](./ANALISE-PROFUNDA.md)                                       |
| Read the management summary                           | [Executive report](./RELATORIO-EXECUTIVO.md)                                 |

## Current Azure learning stack

The successful learning deployment uses these exact target values:

| Target                     | Canonical value                                     |
| -------------------------- | --------------------------------------------------- |
| Repository                 | `Samuel-Ricardo/Tax-Invoice-Issuer-FC`              |
| Region observed            | Brazil South                                        |
| Resource group             | `rg-tax-invoice-fc-learn`                           |
| Container Apps environment | `env-tax-invoice-fc-learn`                          |
| Container App              | `app-tax-invoice-fc-learn`                          |
| PostgreSQL                 | `psql-tax-invoice-fc-learn`                         |
| Key Vault                  | `kv-tax-invoice-fc-learn`                           |
| Log Analytics              | `law-tax-invoice-fc-learn`                          |
| Image                      | `ghcr.io/samuel-ricardo/tax-invoice-issuer-fc:main` |

The current network model uses two initially separate VNets: application
`vnet-tax-invoice-fc` with subnet `default`, and database
`rg-tax-invoice-fc-learn-vnet` with subnet `default`. They use bidirectional
peerings `peer-to-db-vnet` and `peer-to-app-vnet`. The PostgreSQL private DNS zone
is `psql-tax-invoice-fc-learn.private.postgres.database.azure.com`, linked to the
application VNet as `link-app-vnet` with auto-registration disabled. This is the
PostgreSQL Flexible Server private access/VNet integration path.

The workflow uses GitHub environment `production`, Azure OIDC, and these exact
environment secrets: `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`,
`AZURE_SUBSCRIPTION_ID`, `GHCR_USERNAME`, and `GHCR_READ_TOKEN`. Its federated
credential subject is exactly
`repo:Samuel-Ricardo/Tax-Invoice-Issuer-FC:environment:production`; the issuer is
`https://token.actions.githubusercontent.com` and the audience is
`api://AzureADTokenExchange`. The OIDC identity has **Contributor** on the
current resource group. The Container App system-assigned identity separately
has **Key Vault Secrets User** on the Key Vault.

The build uses `GITHUB_TOKEN` to publish to GHCR. Container Apps pulls use the
durable `GHCR_USERNAME` and `GHCR_READ_TOKEN` values. `GITHUB_TOKEN` is not a
durable runtime pull credential. The workflow does not use `AZURE_CREDENTIALS`.
The workflow does not run application tests or lint, so a green Actions run alone
is not runtime proof.

## Azure document map

- [Manual deployment guide](./deploy/azure/manual/step-by-step-guide.md) —
  primary runbook from prerequisites through hello-world acceptance.
- [Azure deployment overview](./deploy/azure/README.md) — concise current
  topology, identity, registry, and limitation summary.
- [Federated credential guide](../azure-federated-credential-guide.md) — exact
  OIDC subject, issuer, audience, and RBAC checks.
- [Historical architecture](./deploy/azure/ARCHITECTURE.md) — retained for
  historical context; not current deployment instructions.
- [Legacy Bicep setup guide](./deploy/azure/SETUP-GUIDE.md) — retained as a
  historical/default IaC record; it does not provision the current `-learn`
  target.
- [Azure cost analysis](./deploy/azure/COST-ANALYSIS.md) — historical cost
  assumptions; verify current Azure pricing and resource names separately.

`infra_public/` Bicep/setup scripts are legacy/non-current for this learning
stack. Old names such as `rg-tax-invoice-fc`, `cae-tax-invoice-fc`,
`ca-tax-invoice-fc-api`, `psql-tax-invoice-fc`, `law-tax-invoice-fc`, and
`kv-tax-invoice-fc` must not be mixed with the `-learn` resources.

## API and testing resources

- [Quick-start testing guide](./QUICK-START-TESTS.md) — local project testing.
- [Postman collection guide](../postman/README.md) — current Azure `baseUrl`
  update and local/Azure test flow.
- [Postman collection](../postman/Tax-Invoice-Issuer.postman_collection.json)
- [Local Postman environment](../postman/Tax-Invoice-Issuer.postman_environment.json)
- [Azure Postman environment](../postman/Tax-Invoice-Issuer-Azure.postman_environment.json)
  — contains an observed URL; replace `baseUrl` with the current Portal
  Application Url before use.

### API route status

The application uses `GET /` as its HTTP smoke test and returns
`{"hello":"world"}` with HTTP `200`. It has no `/health` route. The repository
can generate [`docs/swagger.json`](./swagger.json) with
`npm run docs:swagger`, but the application does not serve `/swagger`,
`/api-docs`, or `/swagger.json`; a `404` for those paths is expected.

The application requires one complete `DATABASE_URL` value. Store it in Key Vault
as `database-url` and map it through Container Apps secret `kv-database-url`.
Separate database variables do not assemble the URL. The database schema is
optional for hello-world and required only for `POST /invoice`.
The `main` deployment workflow runs the additive migrations from
`migration/versions/` in an Azure Container Apps Job before updating the
application. It requires the repository variable `AZURE_MIGRATION_JOB_NAME`.

The confirmed log result is `[DATABASE] | Connected with PostgreSQL`, and
`POST /invoice` connectivity succeeds after the network fix. Some application
errors still return HTTP `200` with `status: 500` in the body; this is a remaining
code defect, not an Azure fix.

## Project reference

- [Versioned database migrations](../migration/versions/)
- [Security architecture review](./SECURITY-ARCHITECTURE-REVIEW.md) — historical
  review; do not use its old Azure deployment claims.
- [Secrets-management ADR](./ADR-001-secrets-management.md) — historical record;
  verify Azure claims against the current manual guide.
- [Zod example](./zod-example.md)
- [Docker/WSL cleanup guide](./utils/docker/README.md)

**Last reviewed:** 2026-08-21
