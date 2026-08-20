# Azure deployment

This page is a concise map of the Azure deployment. The [manual deployment
guide](./manual/step-by-step-guide.md) is the source of truth for the current
learning stack, Portal steps, runtime contract, workflow, verification, and
troubleshooting.

## Current learning target

The current successful workflow target is exactly:

| Resource                   | Canonical value                                     |
| -------------------------- | --------------------------------------------------- |
| Resource group             | `rg-tax-invoice-fc-learn`                           |
| Container Apps environment | `env-tax-invoice-fc-learn`                          |
| Container App              | `app-tax-invoice-fc-learn`                          |
| Image                      | `ghcr.io/samuel-ricardo/tax-invoice-issuer-fc:main` |

Recorded supporting resources are `psql-tax-invoice-fc-learn`,
`kv-tax-invoice-fc-learn`, and `law-tax-invoice-fc-learn`. Verify their current
state in the Azure Portal before troubleshooting.

The recorded application URL is an observation, not a permanent identifier:

```text
https://app-tax-invoice-fc-learn.nicebay-c5601d68.brazilsouth.azurecontainerapps.io
```

Copy the current **Application Url** from the Container App **Overview** page
before testing. The public ingress target port is `3000`; clients use the
managed HTTPS URL on port `443`.

## Current GitHub Actions workflow

For a push to `main`, the current path is:

```text
build image → push to GHCR → sign image → Azure OIDC login → update Container App
```

The deploy job:

- runs in the GitHub environment `production`;
- uses `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, and `AZURE_SUBSCRIPTION_ID`;
- requires `id-token: write`;
- passes `containerAppEnvironment: env-tax-invoice-fc-learn`;
- passes the normalized lowercase image output, which resolves to the canonical
  image above.

The workflow does **not** run `npm test` or lint. It signs the published image,
but deploys the `:main` tag rather than an immutable digest. The current GHCR
credential is the run-scoped, ephemeral `GITHUB_TOKEN`; it is not a durable
production registry credential and can fail on a later Container Apps restart or
scale-to-zero image pull. A follow-up should use Azure Container Registry (ACR)
with Container Apps managed identity, or a dedicated durable read-only PAT.

The current workflow does not use the historical `AZURE_CREDENTIALS` service-
principal JSON secret. Adding that old secret does not repair current OIDC or
RBAC failures.

## Runtime contract

The application requires one complete `DATABASE_URL`, including
`sslmode=require`. Separate `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`,
`DATABASE_NAME`, and `DATABASE_PASSWORD` variables do not assemble the URL.
The current pattern is a Key Vault secret reference bound to the Container App
variable `DATABASE_URL`.

PostgreSQL uses private access in the documented learning topology. Run
`migration/create.sql` from a host with a valid path to the private VNet; a
normal laptop or ordinary Cloud Shell session is not automatically connected to
that VNet. Test `POST /invoice` only after the database and schema are ready.

`GET /` is the HTTP smoke check and should return HTTP `200` with
`{"hello":"world"}`. There is no `/health` route. The repository can generate
`docs/swagger.json` with `swagger.js` and `npm run docs:swagger`, but the current
application serves no `/swagger`, `/api-docs`, or `/swagger.json` route. A `404`
for those paths is expected.

## Legacy/default Bicep stack

The public Bicep template and older deployment documents describe a separate
legacy/default stack. Examples include:

- `rg-tax-invoice-fc`
- `cae-tax-invoice-fc`
- `ca-tax-invoice-fc-api`
- `psql-tax-invoice-fc`
- `law-tax-invoice-fc`
- `kv-tax-invoice-fc`

These names are not aliases for the current `-learn` resources. The Bicep
template does **not** provision the current successful learning workflow target.
Do not mix its names, networking, or database-variable examples with this stack.

## Related documents

- [Manual Portal deployment and workflow guide](./manual/step-by-step-guide.md)
- [Historical architecture reference](./ARCHITECTURE.md)
- [Separate Bicep setup guide](./SETUP-GUIDE.md)
- [Azure cost analysis](./COST-ANALYSIS.md)
- [Project README](../../../README.md)
- [Documentation index](../../INDEX.md)

## Official references

- [Azure Container Apps environments](https://learn.microsoft.com/en-us/azure/container-apps/environment)
- [Custom virtual networks for Container Apps](https://learn.microsoft.com/en-us/azure/container-apps/custom-virtual-networks)
- [Container Apps ingress](https://learn.microsoft.com/en-us/azure/container-apps/ingress-how-to)
- [Container Apps secrets and Key Vault references](https://learn.microsoft.com/en-us/azure/container-apps/manage-secrets)
- [PostgreSQL Flexible Server private access](https://learn.microsoft.com/en-us/azure/postgresql/network/concepts-networking-private)
- [GitHub Actions deployment for Container Apps](https://learn.microsoft.com/en-us/azure/container-apps/github-actions)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-the-container-registry)
