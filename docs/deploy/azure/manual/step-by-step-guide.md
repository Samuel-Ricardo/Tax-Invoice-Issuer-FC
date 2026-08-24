# How to deploy and test the Azure learning stack

> **Status:** Current source of truth for the successful learning stack
>
> **Reviewed:** 2026-08-21
>
> This runbook starts with an empty Azure resource group, creates the network and
> supporting services in the Azure portal, configures the identities and secrets,
> deploys the application through the current GitHub Actions workflow, and verifies
> application-to-PostgreSQL connectivity. It does not modify application code or
> provision the stack with the legacy Bicep files.
>
> **Security:** Use placeholders in notes and commands. Never put a database
> password, GitHub personal access token (PAT), complete `DATABASE_URL`, or secret
> value in this repository, a command, a log, a screenshot, or a commit.

## Contents

- [What you are building](#what-you-are-building)
- [Canonical target](#canonical-target)
- [Identities and credentials](#identities-and-credentials)
- [Prerequisites](#prerequisites)
- [Phase 1: one-time infrastructure setup](#phase-1-one-time-infrastructure-setup)
  - [1. Create the resource group](#1-create-the-resource-group)
  - [2. Create the application and database VNets](#2-create-the-application-and-database-vnets)
  - [3. Create PostgreSQL](#3-create-postgresql)
  - [4. Peer the VNets and link private DNS](#4-peer-the-vnets-and-link-private-dns)
  - [5. Create Log Analytics](#5-create-log-analytics)
  - [6. Create Key Vault and its database secret](#6-create-key-vault-and-its-database-secret)
  - [7. Create the Container Apps environment and app](#7-create-the-container-apps-environment-and-app)
  - [8. Enable the runtime identity and grant RBAC](#8-enable-the-runtime-identity-and-grant-rbac)
  - [9. Map `DATABASE_URL` to Key Vault](#9-map-database_url-to-key-vault)
  - [10. Configure GitHub OIDC, GHCR, and deployment RBAC](#10-configure-github-oidc-ghcr-and-deployment-rbac)
- [Phase 2: code deployments](#phase-2-code-deployments)
  - [11. Run the first deployment](#11-run-the-first-deployment)
  - [12. Deploy later code changes](#12-deploy-later-code-changes)
- [Phase 3: verify and test](#phase-3-verify-and-test)
  - [13. Verify the workflow and revision](#13-verify-the-workflow-and-revision)
  - [14. Inspect logs without exposing secrets](#14-inspect-logs-without-exposing-secrets)
  - [15. Hello-world acceptance checklist](#15-hello-world-acceptance-checklist)
  - [16. Test with curl](#16-test-with-curl)
  - [17. Test with Postman](#17-test-with-postman)
  - [18. Optional database schema and invoice test](#18-optional-database-schema-and-invoice-test)
- [Incident ledger and troubleshooting](#incident-ledger-and-troubleshooting)
- [Legacy and historical documentation](#legacy-and-historical-documentation)
- [References](#references)

## What you are building

The current learning stack has a public HTTPS API and private PostgreSQL traffic.
The Container Apps environment and PostgreSQL initially use separate VNets. The
VNets communicate through bidirectional peering, and the PostgreSQL private DNS
zone is linked to the application VNet. The application connects to the server's
normal FQDN, which resolves through the private DNS configuration.

The application reads one required runtime variable: `DATABASE_URL`. The value is
stored as the complete connection URL in Key Vault and exposed to the container
through a Key Vault-backed Container Apps secret. The application does not build a
URL from separate database variables.

```mermaid
flowchart LR
    Client[Client] -->|Public HTTPS 443| App[Container App\napp-tax-invoice-fc-learn]
    Actions[GitHub Actions\nOIDC] -->|Deploy revision| App
    GHCR[GHCR\nlowercase :main image] -->|Runtime pull\ndurable PAT| App

    subgraph AppVNet[Application VNet\nvnet-tax-invoice-fc]
        Env[Container Apps environment\nenv-tax-invoice-fc-learn]
        Env -. hosts .-> App
    end

    subgraph DbVNet[Database VNet\nrg-tax-invoice-fc-learn-vnet]
        App -->|TCP 5432\nserver FQDN| DB[(PostgreSQL\npsql-tax-invoice-fc-learn)]
        DNS[Private DNS zone\npsql-tax-invoice-fc-learn.private.postgres.database.azure.com]
        DNS -. linked to .-> DbVNet
    end

    AppVNet <-->|peer-to-db-vnet\npeer-to-app-vnet| DbVNet

    App -->|Key Vault reference\nsystem identity| KV[Key Vault\nkv-tax-invoice-fc-learn]
    Env --> Logs[Log Analytics\nlaw-tax-invoice-fc-learn]
```

The application VNet is `vnet-tax-invoice-fc` and uses its `default` subnet. The
database VNet is `rg-tax-invoice-fc-learn-vnet` and also uses its `default` subnet.
The database uses PostgreSQL Flexible Server private access/VNet integration; this
path does not use a PostgreSQL Private Endpoint. Log Analytics and Key Vault remain
Azure service resources associated through their service configuration. Configure
a Key Vault private endpoint only when it is explicitly required and verified.

## Canonical target

Use these values exactly when rebuilding the recorded learning stack:

| Resource                    | Canonical value                                                 |
| --------------------------- | --------------------------------------------------------------- |
| Repository                  | `Samuel-Ricardo/Tax-Invoice-Issuer-FC`                          |
| Region observed             | Brazil South                                                    |
| Resource group              | `rg-tax-invoice-fc-learn`                                       |
| Container Apps environment  | `env-tax-invoice-fc-learn`                                      |
| Container App               | `app-tax-invoice-fc-learn`                                      |
| PostgreSQL                  | `psql-tax-invoice-fc-learn`                                     |
| Key Vault                   | `kv-tax-invoice-fc-learn`                                       |
| Log Analytics               | `law-tax-invoice-fc-learn`                                      |
| Container image             | `ghcr.io/samuel-ricardo/tax-invoice-issuer-fc:main`             |
| App VNet                    | `vnet-tax-invoice-fc`                                           |
| App subnet                  | `default`                                                       |
| Database VNet               | `rg-tax-invoice-fc-learn-vnet`                                  |
| Database subnet             | `default`                                                       |
| PostgreSQL version          | `18.4`                                                          |
| PostgreSQL SKU              | Burstable `B1ms`                                                |
| PostgreSQL FQDN             | `psql-tax-invoice-fc-learn.postgres.database.azure.com`         |
| PostgreSQL private DNS zone | `psql-tax-invoice-fc-learn.private.postgres.database.azure.com` |

The recorded learning stack uses the exact VNet and subnet names shown above.
Azure may require a different subnet layout for a new environment; if you rebuild
the stack with different names, record those names in the deployment notes rather
than silently mixing them with this target.

The Container App FQDN is not permanent. Always copy the current **Application
Url** from the Container App **Overview** page immediately before testing. Do not
append `:3000`; the public endpoint uses HTTPS on port `443` and routes to the
container's target port `3000`.

## Identities and credentials

Keep these three mechanisms separate:

| Mechanism                              | Where it is configured                                                              | Purpose                                                              | Required access                                                        |
| -------------------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| GitHub OIDC deployment identity        | Microsoft Entra ID federated credential; client ID stored as `AZURE_CLIENT_ID`      | Lets GitHub Actions authenticate to Azure without a client secret    | **Contributor** at resource-group scope on `rg-tax-invoice-fc-learn`   |
| Container App system-assigned identity | `app-tax-invoice-fc-learn` → **Identity**                                           | Lets the running app read `database-url` from Key Vault              | **Key Vault Secrets User** on `kv-tax-invoice-fc-learn`                |
| GHCR PAT                               | GitHub `production` environment as `GHCR_READ_TOKEN`, then passed to Container Apps | Lets Container Apps pull the private GHCR image after a workflow run | Classic GitHub PAT with `read:packages`; this is not an Azure identity |

The build job uses the run-scoped `GITHUB_TOKEN` to publish the image to GHCR.
The deploy action uses `GHCR_USERNAME` and the durable `GHCR_READ_TOKEN` for the
Container App registry configuration. `GITHUB_TOKEN` must not be used as the
runtime pull credential because it expires with the workflow run.

The person creating or viewing Key Vault secrets is a separate human operator.
**Owner** on the subscription or resource group does not grant Key Vault secret
data-plane access. The operator needs **Key Vault Administrator** at the vault
scope, or an administrator must create the secret for them. The application still
uses **Key Vault Secrets User**, not Key Vault Administrator.

## Prerequisites

Before starting, make sure you have:

- an Azure subscription and permission to create the listed resources, VNets,
  private access configuration, and RBAC assignments;
- access to the `Samuel-Ricardo/Tax-Invoice-Issuer-FC` repository with permission
  to configure the GitHub `production` environment;
- a GitHub account that can create a classic PAT with `read:packages` for the
  package used by the application;
- a PostgreSQL client such as `psql` on a host that can join or reach the VNet,
  if you later run the optional migration;
- a password manager or approved secret store for the PostgreSQL administrator
  password and GHCR PAT;
- an existing Azure Container Apps migration Job, with its name configured as
  the repository variable `AZURE_MIGRATION_JOB_NAME`;
- the current `main` branch and the repository's existing
  `.github/workflows/docker-publish.yaml` file.

A normal laptop or ordinary Azure Cloud Shell session is not automatically
connected to the custom VNet. Do not plan the database migration or a private DNS
check from an unconnected host.

## Phase 1: one-time infrastructure setup

Complete Steps 1–10 once. These steps create the platform contract that later
code deployments reuse. Do not recreate the infrastructure for each code change.

### 1. Create the resource group

1. Open the [Azure Portal](https://portal.azure.com/).
2. Search for **Resource groups** and select **Create**.
3. Select the target subscription.
4. Set **Resource group** to `rg-tax-invoice-fc-learn`.
5. Set **Region** to the region used by the learning stack. The recorded stack
   used **Brazil South**.
6. Select **Review + create**, validate the name, and select **Create**.

Do not use the old `rg-tax-invoice-fc` resource group for this workflow.

### 2. Create the application and database VNets

1. In the application resource group, create or select VNet
   `vnet-tax-invoice-fc`.
2. Use the VNet's `default` subnet for the Container Apps environment, following
   the subnet requirements shown by the current Azure portal flow.
3. Create or select the database VNet `rg-tax-invoice-fc-learn-vnet`.
4. Use the database VNet's `default` subnet for PostgreSQL private access.
5. Record the address ranges and confirm that the VNets do not overlap.

The successful stack initially had separate application and database VNets. The
peering and DNS link in Step 4 provide the cross-VNet path. Do not substitute a
Private Endpoint topology or copy subnet names from the legacy Bicep documents.

### 3. Create PostgreSQL

1. Search for **Azure Database for PostgreSQL flexible servers** and select
   **Create**.
2. Select the subscription that contains `rg-tax-invoice-fc-learn` and the
   recorded region.
3. Set the server name to `psql-tax-invoice-fc-learn`.
4. Select PostgreSQL version `18.4` and the Burstable `B1ms` SKU.
5. Set an administrator username and a strong password. Store the password
   outside the repository.
6. Create the application database and record its name as `<DATABASE_NAME>`.
7. At the networking step, select private access/VNet integration, then choose
   VNet `rg-tax-invoice-fc-learn-vnet` and subnet `default`. Do not add a broad
   public firewall rule.
8. Create the server and wait until its state is **Ready**.
9. On the server **Overview** page, copy the server FQDN into a secure note as
   `<POSTGRES_FQDN>`. Use this FQDN later in `DATABASE_URL`; do not put the
   password in that note or in this repository.

The cross-VNet path is completed in the next step. This is Flexible Server private
access/VNet integration, not a PostgreSQL Private Endpoint deployment.

### 4. Peer the VNets and link private DNS

1. Open `vnet-tax-invoice-fc` and add a peering to the database VNet
   `rg-tax-invoice-fc-learn-vnet`.
2. Set the application-side peering name to `peer-to-db-vnet`.
3. Enable virtual network access in both directions.
4. On `rg-tax-invoice-fc-learn-vnet`, add the reverse peering to
   `vnet-tax-invoice-fc` with the name `peer-to-app-vnet`.
5. Confirm both peerings show **Connected**.
6. Open the PostgreSQL private DNS zone:
   `psql-tax-invoice-fc-learn.private.postgres.database.azure.com`.
7. Add a VNet link named `link-app-vnet` to `vnet-tax-invoice-fc`.
8. Leave auto-registration disabled, then save the link.
9. Confirm the zone contains the PostgreSQL server record and that the app VNet
   link shows **Completed** or **Succeeded**.

The application uses the PostgreSQL server FQDN
`psql-tax-invoice-fc-learn.postgres.database.azure.com`. From the application VNet,
the linked private DNS zone resolves that FQDN to the private address. Do not
replace the zone with `privatelink.postgres.database.azure.com`; that is not the
zone used by the successful stack.

From an approved VNet-connected administration host, a safe DNS-only check is:

```bash
nslookup psql-tax-invoice-fc-learn.postgres.database.azure.com
```

The result should resolve through the linked private DNS configuration to a
private address. Never include a password in a DNS or database test command.

### 5. Create Log Analytics

1. In `rg-tax-invoice-fc-learn`, search for **Log Analytics workspaces** and
   select **Create**.
2. Set the workspace name to `law-tax-invoice-fc-learn`.
3. Select the same region as the Container Apps environment.
4. Review the retention and pricing settings for the subscription.
5. Create the workspace.

You select this workspace when creating the Container Apps environment.

### 6. Create Key Vault and its database secret

#### Create the vault

1. In `rg-tax-invoice-fc-learn`, search for **Key vaults** and select **Create**.
2. Set the vault name to `kv-tax-invoice-fc-learn`.
3. Select **Azure role-based access control** as the permission model.
4. Configure network access so the Container App can reach Key Vault. This
   runbook does not claim that the successful learning stack has a Key Vault
   private endpoint. If you disable public access, configure and verify a
   separate private endpoint and DNS path before continuing.
5. Select **Review + create**, validate the name, and select **Create**.
6. If you are the operator who must create or view secrets, obtain **Key Vault
   Administrator** at the vault scope. Do not rely on subscription **Owner**
   alone for secret data-plane access.

#### Store the complete database URL

The runtime code calls `requiredSecret("DATABASE_URL")`. It reads one complete
value and fails at startup when that variable is missing. In the Key Vault
**Secrets** blade:

1. Select **Generate/Import**.
2. Select **Manual**.
3. Set **Name** to `database-url`.
4. In the value field, enter a complete URL with your private server details:

   ```text
   postgresql://<DATABASE_USER>:<URL_ENCODED_PASSWORD>@<POSTGRES_FQDN>:5432/<DATABASE_NAME>?sslmode=require
   ```

5. URL-encode reserved characters in the password, including `@`, `:`, `/`, and
   `#`, before placing it in the secure Key Vault field.
6. Create the secret and verify only its **name**, **enabled** state, and
   **Secret Identifier**. Do not copy its value into documentation or logs.

Do not map a password-only secret such as `kv-postgress-password` to
`DATABASE_URL`. `ghcrio-samuel-ricardo` is registry-related, not application
database configuration. Separate variables such as `DATABASE_HOST`,
`DATABASE_PORT`, `DATABASE_USER`, `DATABASE_NAME`, and `DATABASE_PASSWORD` do not
assemble the URL for this application.

### 7. Create the Container Apps environment and app

Create the environment first when the Portal offers separate environment setup.
If the Portal creates it inline, verify every value before selecting **Create**.

#### Create the environment

1. Search for **Container Apps** and select **Create** → **Container App**.
2. Select resource group `rg-tax-invoice-fc-learn`.
3. Set the app name to `app-tax-invoice-fc-learn`.
4. Select the recorded region, **Brazil South**.
5. Create or select the environment named `env-tax-invoice-fc-learn`.
6. Select `law-tax-invoice-fc-learn` for monitoring.
7. Choose **Use your own virtual network**.
8. Select `vnet-tax-invoice-fc` and its `default` subnet.
9. Select the supported environment type and apply the subnet size and
   delegation required by the current Portal flow. Do not copy requirements
   from a different Container Apps environment type.
10. Choose an external/public environment configuration. Do not make the
    environment internal-only because the hello-world acceptance test requires
    public HTTPS ingress.

Keep the `default` subnet assigned to the Container Apps environment according to
the current portal requirements. Do not configure a PostgreSQL private endpoint
for this stack.

#### Configure the app container

1. Clear **Use quickstart image** if it is selected.
2. Select **Docker Hub or other registries**.
3. Set **Registry server** to `ghcr.io`.
4. Set the complete lowercase image reference to:

   ```text
   ghcr.io/samuel-ricardo/tax-invoice-issuer-fc:main
   ```

5. If the package is private, select the private registry option and enter the
   GitHub username and a durable classic PAT with `read:packages`. Do not paste
   the PAT into this guide or a terminal transcript.
6. Set the **Target port** to `3000`.
7. Add these non-secret environment variables:

   | Name       | Value        |
   | ---------- | ------------ |
   | `NODE_ENV` | `production` |
   | `PORT`     | `3000`       |

#### Configure ingress and scale

Use these learning settings unless the current Portal requires a documented
variation:

- **Ingress:** enabled.
- **Traffic:** external.
- **Transport:** HTTP or Auto, according to the current Portal label.
- **Target port:** `3000`.
- **Insecure connections:** disabled; use HTTPS.
- **Minimum replicas:** `0`.
- **Maximum replicas:** `1`.

Select **Review + create**. Before creating, verify the resource group,
environment, app, image, and target port against the canonical target table.

### 8. Enable the runtime identity and grant RBAC

#### Enable the Container App identity

1. Open `app-tax-invoice-fc-learn`.
2. Open **Identity** under **Security**.
3. On **System assigned**, set **Status** to **On** and select **Save**.
4. Record the current **Principal ID** for troubleshooting. Do not publish it as
   a secret; it is only an identifier.

#### Grant the runtime role to the correct identity

1. Open `kv-tax-invoice-fc-learn`.
2. Open **Access control (IAM)**.
3. Select **Add role assignment**.
4. Choose **Key Vault Secrets User**.
5. Assign access to a **Managed identity**.
6. Select the system-assigned identity belonging to
   `app-tax-invoice-fc-learn`.
7. Review and assign the role at the Key Vault scope.

This is the runtime identity, not the GitHub OIDC deployment identity. If the
system-assigned identity is disabled and enabled again, Azure can issue a new
principal ID; assign the role to the current identity again.

### 9. Map `DATABASE_URL` to Key Vault

1. In `app-tax-invoice-fc-learn`, open **Secrets** or **Configuration**.
2. Add an application secret with:
   - **Name:** `kv-database-url`.
   - **Type:** Key Vault reference.
   - **Key Vault secret URI:** the **Secret Identifier** for `database-url`.
   - **Identity:** **System assigned**.
3. Save the application secret.
4. In the container environment variables, add:
   - **Name:** `DATABASE_URL`.
   - **Source:** an existing Container Apps secret.
   - **Secret:** `kv-database-url`.
5. Save the configuration and create a new revision or restart when the Portal
   requests it.

The final mapping must be:

```text
Key Vault database-url
        ↓ Key Vault reference, system-assigned identity
Container Apps secret kv-database-url
        ↓ secret reference
Container environment variable DATABASE_URL
```

Do not map `kv-postgress-password`, a password-only secret, or
`ghcrio-samuel-ricardo` to `DATABASE_URL`. The latter belongs to registry
configuration. A missing mapping causes the application to fail fast with
`SecretError`.

### 10. Configure GitHub OIDC, GHCR, and deployment RBAC

Complete this step after the Azure target exists and before the first code
push.

#### Configure the federated credential

The current workflow deploys from the GitHub `production` environment. The
federated credential must match the environment subject exactly.

1. In the Azure Portal, open **Microsoft Entra ID** → **App registrations**.
2. Select the application whose client ID is the value used for
   `AZURE_CLIENT_ID`.
3. Open **Manage** → **Federated credentials**.
4. If the credential is attached to a user-assigned managed identity instead,
   open that identity and its **Federated credentials** blade.
5. Add a credential using **GitHub Actions deploying Azure resources**.
6. Set the repository to `Samuel-Ricardo/Tax-Invoice-Issuer-FC`.
7. Set the GitHub environment name to `production`.
8. Verify these resulting claims exactly:

   | Claim    | Required value                                                     |
   | -------- | ------------------------------------------------------------------ |
   | Subject  | `repo:Samuel-Ricardo/Tax-Invoice-Issuer-FC:environment:production` |
   | Issuer   | `https://token.actions.githubusercontent.com`                      |
   | Audience | `api://AzureADTokenExchange`                                       |

9. Wait for propagation before testing a newly created or changed credential.

Do not configure only the branch subject
`repo:Samuel-Ricardo/Tax-Invoice-Issuer-FC:ref:refs/heads/main` for this workflow.
Do not replace OIDC with `AZURE_CREDENTIALS` or an Azure client secret.

#### Configure the GitHub production environment

In the GitHub repository, open **Settings** → **Environments** →
**production** → **Environment secrets**. The current set is exactly:

| Secret                  | Purpose                                     |
| ----------------------- | ------------------------------------------- |
| `AZURE_CLIENT_ID`       | Client ID of the OIDC deployment identity   |
| `AZURE_TENANT_ID`       | Microsoft Entra tenant ID                   |
| `AZURE_SUBSCRIPTION_ID` | Subscription containing the learning stack  |
| `GHCR_USERNAME`         | GitHub username for the registry credential |
| `GHCR_READ_TOKEN`       | Durable classic PAT with `read:packages`    |

Do not put these values in Markdown, workflow output, screenshots, or commits.
Do not add `AZURE_CREDENTIALS` for this deployment path.

#### Grant deployment RBAC to the OIDC identity

1. Open **Resource groups** → `rg-tax-invoice-fc-learn`.
2. Open **Access control (IAM)** → **Role assignments**.
3. Find the principal whose client ID matches `AZURE_CLIENT_ID`.
4. Confirm it has **Contributor** at the resource-group scope
   `rg-tax-invoice-fc-learn`.
5. If it is missing, select **Add role assignment** and assign **Contributor** to
   the GitHub OIDC deployment identity at that resource-group scope.
6. Wait for RBAC propagation before rerunning a failed workflow.

The OIDC identity updates Azure resources. The Container App system-assigned
identity reads Key Vault. Never grant the GitHub identity the runtime role by
mistake, or grant the runtime identity the deployment role just to make a
workflow pass.

## Phase 2: code deployments

Steps 11–12 are separate from the one-time infrastructure setup. A code
deployment updates the existing Container App revision; it does not recreate the
VNet, private endpoint, database, Key Vault, or RBAC.

### 11. Run the first deployment

1. Confirm Steps 1–10 are complete.
2. Confirm the GitHub `production` environment contains the five exact secrets.
3. Confirm the federated credential subject, issuer, and audience match exactly.
4. Confirm the OIDC identity has **Contributor** on
   `rg-tax-invoice-fc-learn`.
5. Confirm the Container App registry configuration uses the lowercase image and
   the durable GHCR credential.
6. Confirm `AZURE_MIGRATION_JOB_NAME` names the intended existing migration Job
   and that the Job has private network access to PostgreSQL.
7. Push the intended code to `main` using the repository's normal review process.
   The current workflow is triggered by a push to `main`.
8. Open the repository **Actions** tab and select the `docker-publish` run.
9. Watch the `build` job, migration execution, and then the `deploy` job.

The current deploy action inputs are:

```yaml
resourceGroup: rg-tax-invoice-fc-learn
containerAppName: app-tax-invoice-fc-learn
containerAppEnvironment: env-tax-invoice-fc-learn
imageToDeploy: ghcr.io/samuel-ricardo/tax-invoice-issuer-fc@<application-image-digest>
registryUrl: ghcr.io
registryUsername: ${{ secrets.GHCR_USERNAME }}
registryPassword: ${{ secrets.GHCR_READ_TOKEN }}
```

For a `main` push, the application image is deployed by digest. The workflow
also publishes a human-readable SHA tag, but it must not be used as the
deployment reference:

```text
ghcr.io/samuel-ricardo/tax-invoice-issuer-fc@sha256:<application-image-digest>
```

The build job publishes to GHCR with `GITHUB_TOKEN`. The deploy job passes the
separate durable `GHCR_USERNAME` and `GHCR_READ_TOKEN` values to both the
migration Job and Container Apps. The migration execution must succeed before
the application update is attempted. A green workflow proves that the build,
migration gate, and Azure update completed; it does not prove that the new
revision can pull the image after the run, read Key Vault, reach PostgreSQL, or
serve HTTPS.

### 12. Deploy later code changes

For each later application deployment:

1. Make and review the application change.
2. Push the approved change to `main`.
3. Confirm the `build` job publishes the lowercase `:main` image.
4. Confirm the `deploy` job targets the three `-learn` resource names.
5. Complete the Portal and HTTP acceptance checks in [Phase 3](#phase-3-verify-and-test).

Pull requests build only and do not deploy. Version tags publish an image but do
not deploy because the current deploy job is restricted to `main`.

## Phase 3: verify and test

### 13. Verify the workflow and revision

A green Actions run is necessary but not sufficient. Verify the runtime in the
Azure Portal:

1. Open **Container Apps** → `app-tax-invoice-fc-learn` → **Overview**.
2. Confirm the app belongs to `rg-tax-invoice-fc-learn` and
   `env-tax-invoice-fc-learn`.
3. Confirm **Ingress** is external and enabled.
4. Confirm the target port is `3000` and insecure HTTP is disabled.
5. Copy the current **Application Url**. Store it temporarily as
   `<CURRENT_APP_FQDN>` for the checks below. Do not treat it as permanent.
6. Open **Revisions** and confirm the latest revision is provisioned and healthy.
7. Confirm the revision image is the complete lowercase
   `ghcr.io/samuel-ricardo/tax-invoice-issuer-fc:main` reference.
8. Confirm traffic points to the healthy revision.
9. Open `env-tax-invoice-fc-learn` and confirm public network access is enabled
   when public ingress is intended.

If the environment scales to zero, the first request can be slower while a
replica starts. Send a second root request after the first wake-up request.

### 14. Inspect logs without exposing secrets

1. In the Container App, open **Monitoring** → **Log stream**.
2. Select the active revision and inspect console and system logs.
3. Open the linked `law-tax-invoice-fc-learn` workspace when a longer time range
   or revision comparison is required.
4. Search for `SecretError`, `DATABASE_URL is required`,
   `ImagePullUnauthorized`, `Unauthorized`, `401`, `403`, `AADSTS`, and
   `AuthorizationFailed`.
5. Review names, identities, resource scopes, and status values only. Never print
   the Key Vault secret value, database URL, password, or PAT.

### 15. Hello-world acceptance checklist

The hello-world acceptance test is complete only when all of these checks pass:

- [ ] The resource group is `rg-tax-invoice-fc-learn`.
- [ ] The environment is `env-tax-invoice-fc-learn`.
- [ ] The app is `app-tax-invoice-fc-learn`.
- [ ] The app uses public HTTPS ingress and target port `3000`.
- [ ] The current Application Url was copied from the Portal **Overview** page.
- [ ] The latest revision is provisioned and healthy.
- [ ] The image reference is the lowercase canonical GHCR image.
- [ ] The Container App system-assigned identity is enabled.
- [ ] That runtime identity has **Key Vault Secrets User** on the Key Vault.
- [ ] `DATABASE_URL` maps to `kv-database-url`, which references Key Vault
      secret `database-url` with the system-assigned identity.
- [ ] The application and database VNets are peered in both directions.
- [ ] The PostgreSQL private DNS zone is linked to `vnet-tax-invoice-fc` with
      auto-registration disabled.
- [ ] The GitHub OIDC identity has **Contributor** at the current resource-group
      scope.
- [ ] The Actions run is green.
- [ ] A direct `GET /` returns HTTP `200` and `{"hello":"world"}`.
- [ ] Postman sends `GET {{baseUrl}}/` successfully after `baseUrl` is updated.

A green Actions run alone is not runtime acceptance.

### 16. Test with curl

Replace `<CURRENT_APP_FQDN>` with the HTTPS host copied from the current
Container App **Application Url**. Do not use a historical hostname and do not
append `:3000`.

```bash
curl -i "https://<CURRENT_APP_FQDN>/"
```

Expected result:

```text
HTTP 200
```

```json
{ "hello": "world" }
```

The application has no `/health` endpoint. The root request `GET /` is the
current HTTP smoke test. The application also does not serve `/swagger`,
`/api-docs`, or `/swagger.json`; a `404` for those paths is expected.

### 17. Test with Postman

1. Import the collection and `Tax-Invoice-Issuer-Azure.postman_environment.json`
   from [`postman/`](../../../../postman/).
2. Select the environment **Tax Invoice Issuer - Azure Learn-prod**.
3. Open the environment editor and update `baseUrl` to the current Portal
   **Application Url**, including `https://` and excluding a trailing slash.
4. Save the environment.
5. Send the root request:

   ```text
   GET {{baseUrl}}/
   ```

6. Confirm HTTP `200` and the JSON body `{"hello":"world"}`.

The environment file contains an observed FQDN that can become stale when Azure
recreates the app. Always replace `baseUrl` before a test. Do not edit the
Postman JSON to store a password or token.

### 18. Optional database schema and invoice test

The schema is not required for hello-world acceptance. Database-backed
`POST /invoice` requires the migration gate in the workflow. The Container Apps
Job runs the additive files in `migration/versions/` against the configured
`DATABASE_URL`; it must have a network path through the peered VNets. Do not run
the destructive legacy `migration/create.sql` as part of this workflow.

After PostgreSQL is **Ready**, private DNS works, `DATABASE_URL` is mapped, and the
migration succeeds, an optional API test is:

```bash
curl -i -X POST "https://<CURRENT_APP_FQDN>/invoice" \
  -H "Content-Type: application/json" \
  -d '{"month":1,"year":2024,"type":"cash"}'
```

## Incident ledger and troubleshooting

These six incidents were resolved while establishing the current learning stack.
Use the exact symptom to choose the first check.

| Incident                                      | Exact symptom or log marker                                                                                                                                                      | Root cause                                                                                                                        | Corrective action                                                                                                                                    |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| OIDC environment subject mismatch             | `AADSTS70025: client has no configured federated identity credentials` or `AADSTS70021: No matching federated identity record found for presented assertion`                     | The credential expected a branch subject while the job emitted an environment subject                                             | Configure the exact `repo:Samuel-Ricardo/Tax-Invoice-Issuer-FC:environment:production` subject, then wait for propagation                            |
| Wrong resource group or target names          | `AuthorizationFailed` or `ResourceNotFound` names an old scope such as `rg-tax-invoice-fc`, `cae-tax-invoice-fc`, or `ca-tax-invoice-fc-api`                                     | Workflow inputs targeted the legacy stack                                                                                         | Use `rg-tax-invoice-fc-learn`, `env-tax-invoice-fc-learn`, and `app-tax-invoice-fc-learn` together                                                   |
| RBAC assigned to the wrong identity or scope  | Azure login succeeds, then the deploy step returns `AuthorizationFailed` or HTTP `403`                                                                                           | Contributor was missing from the OIDC identity at the current resource-group scope, or the role was given to the runtime identity | Assign **Contributor** to the OIDC deployment identity on `rg-tax-invoice-fc-learn`; keep runtime RBAC separate                                      |
| Uppercase GHCR image reference                | The revision rejects the image reference or the registry pull fails before application startup; the failed revision shows mixed-case `Samuel-Ricardo/Tax-Invoice-Issuer-FC` text | GHCR/Docker image references require the lowercase repository path used by the successful deployment                              | Use exactly `ghcr.io/samuel-ricardo/tax-invoice-issuer-fc:main` in Portal and workflow output                                                        |
| Ephemeral `GITHUB_TOKEN` used for an ACA pull | `ImagePullUnauthorized`, `401 Unauthorized`, or `403 Forbidden` during a later restart or scale-to-zero wake-up                                                                  | `GITHUB_TOKEN` expired with the workflow run                                                                                      | Keep `GITHUB_TOKEN` for build publication only; configure `GHCR_USERNAME` and durable `GHCR_READ_TOKEN` for Container Apps                           |
| Missing runtime `DATABASE_URL` mapping        | `SecretError: DATABASE_URL is required` and the container exits during startup                                                                                                   | The app secret was not Key Vault-backed, or `DATABASE_URL` was not mapped to `kv-database-url`                                    | Enable the app system identity, grant **Key Vault Secrets User**, create the `database-url` reference, map `DATABASE_URL`, and create a new revision |
| Separate VNets without peering or DNS link    | Startup logs show a PostgreSQL connection failure, or `POST /invoice` cannot connect although the app starts                                                                     | The application VNet could not reach the database VNet or resolve the database's private FQDN                                     | Create `peer-to-db-vnet` and `peer-to-app-vnet`, link the database private DNS zone with `link-app-vnet`, then restart the Container App             |

### Public URL does not respond

Check these values independently:

1. The environment is `env-tax-invoice-fc-learn`.
2. The environment allows public network access.
3. The Container App has external ingress.
4. The target port is `3000`.
5. The request uses the current HTTPS Application Url from **Overview**.
6. The request does not append `:3000`.
7. The first scale-to-zero wake-up request has completed; retry once.

### Key Vault reference cannot fetch the secret

Check only metadata and permissions:

1. The vault uses Azure RBAC.
2. The current system-assigned principal for
   `app-tax-invoice-fc-learn` has **Key Vault Secrets User**.
3. The human operator has **Key Vault Administrator** when viewing or creating
   secrets. **Owner** alone is not sufficient for secret data-plane access.
4. Key Vault contains an enabled `database-url` secret.
5. `kv-database-url` uses the current Secret Identifier and system identity.
6. `DATABASE_URL` points to `kv-database-url`.
7. If Key Vault public access is disabled, its private endpoint and private DNS
   path are approved and reachable from the runtime.
8. Save the configuration and create a new revision or restart.

### Database-backed request fails

A `GET /` success proves HTTP process readiness, not database readiness. For
`POST /invoice`, check PostgreSQL state **Ready**, the bidirectional VNet peerings, the
`psql-tax-invoice-fc-learn.private.postgres.database.azure.com` link named
`link-app-vnet`, private DNS resolution, VNet reachability, the complete Key Vault
URL, URL-encoded password, and the migration Job/schema readiness.

The confirmed fix was:

1. Create `peer-to-db-vnet` from `vnet-tax-invoice-fc` to
   `rg-tax-invoice-fc-learn-vnet`.
2. Create the reverse `peer-to-app-vnet` peering.
3. Link the database private DNS zone to the application VNet with
   `link-app-vnet` and auto-registration disabled.
4. Restart the Container App so it rereads the Key Vault-backed `DATABASE_URL`.

The healthy result is visible in the log stream as
`[DATABASE] | Connected with PostgreSQL`; `POST /invoice` connectivity then
succeeds. A restart can also produce npm `SIGTERM` noise while the old replica
stops. That message is normal during a restart and is not a database failure.

The application still has a separate code defect: some error responses return HTTP
`200` while their body contains `status: 500`. Azure networking and Key Vault do
not fix that response-contract issue.

### Swagger or health URL returns `404`

This is expected for the current application. The repository can generate a
local `docs/swagger.json` file with `npm run docs:swagger`, but the application
serves no Swagger UI or live `/swagger`, `/api-docs`, or `/swagger.json` route.
It also serves no `/health` route. Use `GET /` for hello-world acceptance and
run `POST /invoice` only after the optional database setup.

During startup or restart, `swagger-autogen` can also report that
`/home/node/app/docs/swagger.json` is invalid. This is cosmetic and does not block
the API. Run `npm run docs:swagger` only when you want to regenerate the optional
local Swagger artifact; do not treat it as a live health check.

## Legacy and historical documentation

The following materials are not the current deployment path:

- `infra_public/` Bicep templates and setup scripts are legacy/non-current. They
  describe a different resource set and do not provision the successful `-learn`
  topology.
- Old resource names such as `rg-tax-invoice-fc`, `cae-tax-invoice-fc`,
  `ca-tax-invoice-fc-api`, `psql-tax-invoice-fc`, `law-tax-invoice-fc`, and
  `kv-tax-invoice-fc` are historical/default names. Do not mix them with this
  runbook.
- `docs/deploy/azure/SETUP-GUIDE.md`, the older architecture and cost notes, and
  older security/ADR reports are retained as historical records. They are not
  instructions for the current stack.

Use this guide, [`docs/INDEX.md`](../../../INDEX.md), and the concise
[Azure deployment overview](../README.md) for current instructions.

## References

### Repository evidence

- [Current GitHub Actions workflow](../../../../.github/workflows/docker-publish.yaml)
- [Runtime environment contract](../../../../src/@modules/infra/config/env/env.config.ts)
- [Versioned database migrations](../../../../migration/versions/)
- [Swagger generator](../../../../swagger.js)
- [Postman guide](../../../../postman/README.md)
- [Project README](../../../../README.md)

### Official documentation

- [Azure Container Apps custom virtual networks](https://learn.microsoft.com/en-us/azure/container-apps/custom-virtual-networks)
- [Azure Container Apps ingress](https://learn.microsoft.com/en-us/azure/container-apps/ingress-how-to)
- [Azure Container Apps secrets and Key Vault references](https://learn.microsoft.com/en-us/azure/container-apps/manage-secrets)
- [Azure Database for PostgreSQL private access](https://learn.microsoft.com/en-us/azure/postgresql/network/concepts-networking-private)
- [Publish revisions with GitHub Actions](https://learn.microsoft.com/en-us/azure/container-apps/github-actions)
- [Workload identity federation](https://learn.microsoft.com/en-us/entra/workload-id/workload-identity-federation)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-the-container-registry)
