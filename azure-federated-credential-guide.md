# Configure GitHub OIDC for the Azure learning deployment

This guide configures the federated credential used by the current GitHub Actions
workflow. It is an identity-only companion to the [primary Azure deployment
runbook](docs/deploy/azure/manual/step-by-step-guide.md).

For networking, PostgreSQL, Key Vault secret refresh, and runtime troubleshooting,
use the primary runbook. This document does not duplicate those procedures.

## Current target

The workflow deploys repository `Samuel-Ricardo/Tax-Invoice-Issuer-FC` to:

- resource group: `rg-tax-invoice-fc-learn`;
- Container Apps environment: `env-tax-invoice-fc-learn`;
- Container App: `app-tax-invoice-fc-learn`.

The OIDC identity is separate from the Container App runtime identity and from
the GitHub Container Registry (GHCR) PAT.

## Exact federated credential claims

The deploy job has `environment: production`, so the subject must match the
GitHub environment claim exactly:

| Claim    | Value                                                              |
| -------- | ------------------------------------------------------------------ |
| Subject  | `repo:Samuel-Ricardo/Tax-Invoice-Issuer-FC:environment:production` |
| Issuer   | `https://token.actions.githubusercontent.com`                      |
| Audience | `api://AzureADTokenExchange`                                       |

A branch-only subject such as
`repo:Samuel-Ricardo/Tax-Invoice-Issuer-FC:ref:refs/heads/main` does not match
this job.

## Configure the credential in the Azure portal

1. Open the [Azure portal](https://portal.azure.com/).
2. Open **Microsoft Entra ID**.
3. Open **App registrations** and select the application whose client ID is
   stored as `AZURE_CLIENT_ID` in the GitHub `production` environment.
4. Open **Manage** → **Federated credentials**.
5. If the project uses a user-assigned managed identity instead of an app
   registration, open that identity and use its **Federated credentials** blade.
6. Select **Add credential**.
7. Choose **GitHub Actions deploying Azure resources**.
8. Select repository `Samuel-Ricardo/Tax-Invoice-Issuer-FC`.
9. Select GitHub environment name `production`.
10. Keep the generated issuer and audience values unchanged.
11. Add the credential and verify the resulting Subject, Issuer, and Audience
    against the table above.
12. Wait for propagation before rerunning a workflow. A newly changed credential
    can temporarily return `AADSTS70021` while Azure propagates it.

If an old ref-scoped credential is no longer needed, remove it after confirming
that the environment-scoped credential is present. Do not create a second
branch-only credential as a workaround for this environment deployment.

## Configure Azure RBAC

The identity represented by `AZURE_CLIENT_ID` needs the known working role:

1. Open **Resource groups** → `rg-tax-invoice-fc-learn`.
2. Open **Access control (IAM)**.
3. Select **Add role assignment**.
4. Assign **Contributor** to the OIDC deployment identity at the resource-group
   scope.
5. Verify the assignment uses the OIDC identity, not the Container App's
   system-assigned runtime identity.

OIDC login can succeed while the deploy fails with `AuthorizationFailed` if this
role is missing or assigned to the wrong resource group.

## Configure GitHub environment secrets

In GitHub, open the repository **Settings** → **Environments** → `production`.
The environment secrets are exactly:

| Secret                  | Meaning                                                  |
| ----------------------- | -------------------------------------------------------- |
| `AZURE_CLIENT_ID`       | OIDC identity client ID                                  |
| `AZURE_TENANT_ID`       | Microsoft Entra tenant ID                                |
| `AZURE_SUBSCRIPTION_ID` | Subscription containing `rg-tax-invoice-fc-learn`        |
| `GHCR_USERNAME`         | Username used for the Container Apps registry credential |
| `GHCR_READ_TOKEN`       | Durable classic PAT with `read:packages`                 |

Never write any secret value in this guide, a workflow log, a screenshot, or a
commit. The current workflow does not use `AZURE_CREDENTIALS`.

## Verify the workflow path

The deploy job uses OIDC and the durable GHCR credential with these inputs:

```yaml
environment: production
permissions:
  contents: read
  id-token: write

with:
  resourceGroup: rg-tax-invoice-fc-learn
  containerAppName: app-tax-invoice-fc-learn
  containerAppEnvironment: env-tax-invoice-fc-learn
  imageToDeploy: ghcr.io/samuel-ricardo/tax-invoice-issuer-fc@<application-image-digest>
  registryUrl: ghcr.io
  registryUsername: ${{ secrets.GHCR_USERNAME }}
  registryPassword: ${{ secrets.GHCR_READ_TOKEN }}
```

The build job may use `GITHUB_TOKEN` to publish to GHCR. That token is scoped to
the workflow run and is not a durable Container Apps runtime pull credential.
The workflow also requires the repository variable `AZURE_MIGRATION_JOB_NAME`;
the migration Job must complete successfully before the application revision is
updated. Deployments use immutable image digests rather than the mutable
`main` tag.

After a successful run:

1. Open GitHub **Actions** and confirm Azure login and deployment succeed.
2. Open the Container App **Overview** and **Revisions** pages.
3. Copy the current Application Url.
4. Verify the root endpoint with:

   ```bash
   curl -i "https://<CURRENT_APP_FQDN>/"
   ```

5. Require HTTP `200` and `{"hello":"world"}`. A green Actions run alone is
   not runtime acceptance.

## Troubleshooting

| Symptom                                                | First check                                                                    |
| ------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `AADSTS70025`                                          | The credential is missing or the Subject is not the exact environment subject  |
| `AADSTS70021`                                          | Wait for federated credential propagation, then retry                          |
| `AuthorizationFailed` after successful login           | Contributor is missing from the OIDC identity at `rg-tax-invoice-fc-learn`     |
| `ResourceNotFound` for `rg-tax-invoice-fc`             | A legacy resource-group name is still configured                               |
| `ImagePullUnauthorized`, `401`, or `403` after restart | Container Apps is using an expired `GITHUB_TOKEN` instead of `GHCR_READ_TOKEN` |

For the complete six-incident ledger and runtime troubleshooting, use the
[primary manual runbook](docs/deploy/azure/manual/step-by-step-guide.md).
