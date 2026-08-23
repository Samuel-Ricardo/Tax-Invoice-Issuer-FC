# Azure deployment

The [manual Azure deployment guide](./manual/step-by-step-guide.md) is the
primary source of truth. It describes the current learning stack from scratch,
the one-time infrastructure setup, the separate code-deployment flow, runtime
identities, verification, and troubleshooting.

## Current learning target

Use these values together. They are not interchangeable with the legacy names
listed later in this document.

| Resource                   | Canonical value                                     |
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

The Application Url is dynamic. Copy it from the Container App **Overview**
page before every test. The app exposes public HTTPS ingress on port `443` and
routes to container target port `3000`; do not append `:3000` to the public URL.

## Current network model

The workload uses two initially separate VNets:

- the Container Apps environment uses `vnet-tax-invoice-fc`, subnet `default`;
- PostgreSQL uses `rg-tax-invoice-fc-learn-vnet`, subnet `default`;
- the VNets use bidirectional peerings `peer-to-db-vnet` and `peer-to-app-vnet`;
- the PostgreSQL private DNS zone is
  `psql-tax-invoice-fc-learn.private.postgres.database.azure.com`;
- the zone is linked to the application VNet with `link-app-vnet`, with
  auto-registration disabled;
- the Container App uses the server FQDN
  `psql-tax-invoice-fc-learn.postgres.database.azure.com`.

This is the PostgreSQL Flexible Server private access/VNet integration path. Do
not replace its private DNS zone with `privatelink.postgres.database.azure.com` or
use the old Private Endpoint instructions.

## Runtime contract

The application requires one complete `DATABASE_URL` value. Store it in the
Key Vault secret `database-url`, then configure the Container App secret
`kv-database-url` as a Key Vault reference using the app's system-assigned
identity. Map the container environment variable `DATABASE_URL` to
`kv-database-url`.

Use this shape only as a secure-field template; never commit or print the
resulting value:

```text
postgresql://<DATABASE_USER>:<URL_ENCODED_PASSWORD>@<POSTGRES_FQDN>:5432/<DATABASE_NAME>?sslmode=require
```

The application does not assemble this URL from separate database variables.
`kv-postgress-password` is password-only and must not be mapped to
`DATABASE_URL`. `ghcrio-samuel-ricardo` is registry-related, not database
configuration.

The schema is optional for hello-world. On a `main` deployment, the workflow
first runs the additive migration image as the configured Container Apps Job
(`AZURE_MIGRATION_JOB_NAME`) and blocks the application rollout unless it
succeeds. The job still requires a private-network route to PostgreSQL through the
peered VNets.

The confirmed runtime result is `[DATABASE] | Connected with PostgreSQL` in the
Container Apps log stream, followed by successful `POST /invoice` connectivity.
After changing or recreating the Key Vault secret, recover or purge a soft-deleted
secret name when Azure requires it, then restart the Container App or create a new
revision so it rereads the reference.

The application has a separate known defect: some error responses return HTTP
`200` while their body contains `status: 500`. This remains a code issue and is
not an Azure deployment result.

## Three separate credentials and identities

| Mechanism                              | Purpose                                        | Required access                                         |
| -------------------------------------- | ---------------------------------------------- | ------------------------------------------------------- |
| GitHub OIDC deployment identity        | Authenticates the deploy job to Azure          | **Contributor** on `rg-tax-invoice-fc-learn`            |
| Container App system-assigned identity | Reads the Key Vault database secret at runtime | **Key Vault Secrets User** on `kv-tax-invoice-fc-learn` |
| Durable GHCR classic PAT               | Lets Container Apps pull the private image     | `read:packages`; stored as `GHCR_READ_TOKEN`            |

Subscription **Owner** does not grant Key Vault secret data-plane access to a
human. A human who must create or view secrets needs **Key Vault Administrator**
at the vault scope. This is separate from the runtime role.

## Current GitHub Actions workflow

A push to `main` follows this path:

```text
build and publish application/migration images → sign application image →
Azure OIDC login → run migration job → update Container App revision
```

The deploy job uses GitHub environment `production` and these exact environment
secrets:

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`
- `GHCR_USERNAME`
- `GHCR_READ_TOKEN`

The repository variable `AZURE_MIGRATION_JOB_NAME` must name the existing
Container Apps migration job. The workflow deploys both images by digest; SHA
tags are publishing conveniences only.

The federated credential must have these exact claims:

```text
Subject:  repo:Samuel-Ricardo/Tax-Invoice-Issuer-FC:environment:production
Issuer:   https://token.actions.githubusercontent.com
Audience: api://AzureADTokenExchange
```

The known working Azure RBAC assignment is **Contributor** for the OIDC
identity at the resource-group scope `rg-tax-invoice-fc-learn`.

The build job uses the run-scoped `GITHUB_TOKEN` to publish to GHCR. The deploy
action passes the durable `GHCR_USERNAME` and `GHCR_READ_TOKEN` to Container
Apps. `GITHUB_TOKEN` is not a durable ACA runtime pull credential and must not be
documented as one. A later restart or scale-to-zero pull can fail after that
token expires.

The deploy inputs are:

```yaml
resourceGroup: rg-tax-invoice-fc-learn
containerAppName: app-tax-invoice-fc-learn
containerAppEnvironment: env-tax-invoice-fc-learn
imageToDeploy: ghcr.io/samuel-ricardo/tax-invoice-issuer-fc@<application-image-digest>
registryUrl: ghcr.io
registryUsername: ${{ secrets.GHCR_USERNAME }}
registryPassword: ${{ secrets.GHCR_READ_TOKEN }}
```

The workflow does not run application tests or lint. A green Actions run is not
runtime proof; verify the revision, image pull, Key Vault access, database
reachability, and public HTTP endpoint separately.

## Hello-world verification

1. In the Container App **Overview**, copy the current Application Url.
2. Confirm the latest revision is healthy and uses the lowercase canonical image.
3. Request the root endpoint:

   ```bash
   curl -i "https://<CURRENT_APP_FQDN>/"
   ```

4. Confirm HTTP `200` and:

   ```json
   { "hello": "world" }
   ```

The application has no `/health`, `/swagger`, `/api-docs`, or `/swagger.json`
route. `npm run docs:swagger` generates a local `docs/swagger.json` file; it
does not publish a live Swagger endpoint. Use `GET /` as the deployment smoke
test.

For Postman, select **Tax Invoice Issuer - Azure Learn-prod** and replace
`baseUrl` with the current Portal Application Url before sending:

```text
GET {{baseUrl}}/
```

## Legacy/default materials

The following are not the current deployment path:

- `infra_public/` Bicep files and setup scripts are legacy/non-current and do
  not provision this `-learn` topology.
- `docs/deploy/azure/SETUP-GUIDE.md` is a legacy/default Bicep guide.
- `docs/deploy/azure/ARCHITECTURE.md` and the older cost/security notes contain
  historical names or assumptions. Use them for historical context only.
- Names such as `rg-tax-invoice-fc`, `cae-tax-invoice-fc`,
  `ca-tax-invoice-fc-api`, `psql-tax-invoice-fc`, `law-tax-invoice-fc`, and
  `kv-tax-invoice-fc` are not aliases for the current stack.

## Related documents

- [Primary manual runbook](./manual/step-by-step-guide.md)
- [Federated credential guide](../../../azure-federated-credential-guide.md)
- [Postman guide](../../../postman/README.md)
- [Documentation index](../../INDEX.md)
- [Project README](../../../README.md)

## Official references

- [Azure Container Apps custom virtual networks](https://learn.microsoft.com/en-us/azure/container-apps/custom-virtual-networks)
- [Azure Container Apps ingress](https://learn.microsoft.com/en-us/azure/container-apps/ingress-how-to)
- [Azure Container Apps secrets and Key Vault references](https://learn.microsoft.com/en-us/azure/container-apps/manage-secrets)
- [Azure Database for PostgreSQL private access](https://learn.microsoft.com/en-us/azure/postgresql/network/concepts-networking-private)
- [Publish revisions with GitHub Actions](https://learn.microsoft.com/en-us/azure/container-apps/github-actions)
- [Workload identity federation](https://learn.microsoft.com/en-us/entra/workload-id/workload-identity-federation)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-the-container-registry)
