# 📚 Manual Azure Deployment Guide - Learning Exercise

> **Purpose**: This guide walks you through deploying the Tax-Invoice-Issuer-FC architecture **manually via Azure Portal** to learn Azure concepts before automating with scripts/Bicep.
>
> **Learning Goals**: Understand resource dependencies, networking concepts, security practices, and Azure service configurations.
>
> **Estimated Time**: 45-60 minutes
>
> **Prerequisites**:
>
> - Azure subscription (free tier or Pay-As-You-Go)
> - Basic knowledge of cloud concepts (VMs, databases, networking)
> - GitHub Container Registry (GHCR) image: `ghcr.io/samuel-ricardo/tax-invoice-issuer-fc:main` (built from this repo)
> - Text editor for copying/pasting values
> - **Resource providers registered** on your subscription:
>   - `Microsoft.App` (required for Container Apps)
>   - `Microsoft.OperationalInsights` (required for Log Analytics)
>   - The portal may auto-register these, but it can fail silently. Register explicitly:
>
>     ```bash
>     az provider register --namespace Microsoft.App
>     az provider register --namespace Microsoft.OperationalInsights
>     ```
>
>     Verify status with `az provider show --namespace Microsoft.App --query registrationState` (should read `Registered`).

---

## 🗺️ Architecture Overview (What We'll Build)

![Architecture Diagram](./ARCHITECTURE.md)

We'll create these Azure resources in this order (dependencies matter):

1. **Resource Group** - Logical container
2. **Virtual Network + Subnet** - Private network for secure communication
3. **PostgreSQL Flexible Server** - Database (in VNet, private endpoint)
4. **Log Analytics Workspace** - Monitoring/logs
5. **Key Vault** - Secure secret storage (for DB password)
6. **Container Apps Environment** - Serverless compute platform
7. **Container App** - Our Node.js API (scale-to-zero, from GHCR)

> 💡 **Why this order?** Some resources depend on others (e.g., Container App needs the Environment; Key Vault needs to exist before we can reference its secrets).
>
> 📝 **Portal note**: In the current Azure Portal, the Container Apps Environment (item 6) and the Container App (item 7) are created **in a single flow** — the environment is created inline during Container App creation via the "Create new environment" link on the Basics tab. They remain two distinct ARM resources, but the portal merges their creation into one wizard to streamline the experience.

---

## 📋 Step 1: Create Resource Group

**Purpose**: Logical container to hold all related resources for easy management/deletion.

1. Go to [Azure Portal](https://portal.azure.com)
2. Search for "Resource groups" → Click **+ Create**
3. Fill in:
   - **Subscription**: Your Azure subscription
   - **Resource group**: `rg-tax-invoice-fc-learn` (use `learn` suffix to distinguish from automated deployments)
   - **Region**: `East US` (or nearest to you for lower latency)
4. Click **Review + create** → **Create**

> ✅ **Verification**: You should see your new RG in the list.

---

## 🌐 Step 2: Create Virtual Network & Subnet

**Purpose**: Isolate resources in a private network. Enables secure, private connections between services (no public internet exposure for DB).

1. In your new RG (`rg-tax-invoice-fc-learn`), click **+ Create**
2. Search for "Virtual network" → Select it → **Create**
3. **Basics tab**:
   - Subscription: [your sub]
   - Resource group: `rg-tax-invoice-fc-learn`
   - Name: `vnet-tax-invoice-fc`
   - Region: Same as RG (East US)
4. **IP Addresses tab**:
   - IPv4 address space: `10.0.0.0/16`
   - Click **+ Add subnet**
     - Subnet name: `snet-tax-invoice-fc`
     - Address range: `10.0.1.0/24`
   - Click **Add**
5. **Security tab**: Leave defaults (no Bastion, DDoS protection standard)
6. Click **Review + create** → **Create**

> 🔐 **Learning Point**: This VNet will host our PostgreSQL server privately. The Container App will connect via VNet integration (not public internet).

---

## 🐘 Step 3: Create PostgreSQL Flexible Server

**Purpose**: Managed PostgreSQL database. We'll deploy it inside the VNet for security.

1. In RG, click **+ Create**
2. Search for "Azure Database for PostgreSQL flexible server" → Select → **Create**
3. **Basics tab**:
   - Subscription: [your sub]
   - Resource group: `rg-tax-invoice-fc-learn`
   - Server name: `psql-tax-invoice-fc-learn` (must be globally unique)
   - Region: Same as RG
   - Workload type: `Development` (cheaper, burstable)
   - Version: `15` (LTS)
   - Compute + storage:
     - Click **Configure**
     - Service tier: `Burstable`
     - Compute size: `B1ms` (1 vCore, 2 GiB RAM) → **Matches our architecture**
     - Storage size: `32 GiB`
     - Backup retention: `7 days`
     - Click **OK**
   - Administrator account:
     - Username: `dbadmin` (avoid `postgres` or `admin` for basic security)
     - Password: **Generate a strong password** (16+ chars, mix of types) → **SAVE THIS SECURELY**
4. **Networking tab**:
   - Connectivity method: **Private access (VNet integration)**
   - Virtual network: `vnet-tax-invoice-fc`
   - Subnet: `snet-tax-invoice-fc`
   - ✅ **Enable private endpoint** (this creates a private IP in the subnet for secure access)
5. **Security tab**:
   - Enable SSL/TLS enforcement: **Yes** (required)
   - Allow public network access: **No** (we're using private endpoint only)
6. **Tags tab**: Add optional tags (e.g., `project=tax-invoice-fc`, `environment=learn`)
7. Click **Review + create** → **Create**

> ⏳ **Wait 10-15 minutes** for deployment. This is the longest step.
>
> 🔐 **Learning Point**:
>
> - Private endpoint = database only accessible from within the VNet (no public IP)
> - We chose B1ms (burstable) for cost efficiency in learning scenario
> - Disabling public access is a critical security practice

---

## 📊 Step 4: Create Log Analytics Workspace

**Purpose**: Centralized logging and monitoring for our Container Apps.

1. In RG, click **+ Create**
2. Search for "Log Analytics workspace" → Select → **Create**
3. **Basics tab**:
   - Subscription: [your sub]
   - Resource group: `rg-tax-invoice-fc-learn`
   - Name: `law-tax-invoice-fc-learn` (must be globally unique)
   - Region: Same as RG
4. **Tags tab**: Add same tags as above (optional)
5. Click **Review + create** → **Create**

> 📈 **Learning Point**: This will collect logs from our Container App. Later we can query with Kusto (KQL) language.

---

## 🔐 Step 5: Create Key Vault & Store Secret

**Purpose**: Securely store database password (and other secrets) instead of hardcoding or using app settings.

1. In RG, click **+ Create**
2. Search for "Key vault" → Select → **Create**
3. **Basics tab**:
   - Subscription: [your sub]
   - Resource group: `rg-tax-invoice-fc-learn`
   - Key vault name: `kv-tax-invoice-fc-learn` (globally unique)
   - Region: Same as RG
   - Pricing tier: `Standard` (sufficient for learning)
4. **Access configuration tab**:
   - Permission model: **Azure role-based access control** (modern approach)
   - Leave other defaults
5. **Networking tab**:
   - Private endpoint connections: **+ Add**
     - Name: `pe-kv-tax-invoice-fc-learn`
     - Virtual network: `vnet-tax-invoice-fc`
     - Subnet: `snet-tax-invoice-fc`
     - Click **OK**
6. Click **Review + create** → **Create**

> ⏳ Wait for deployment (~2-3 mins)

### 🔑 Add Database Password to Key Vault

1. Go to your new Key Vault (`kv-tax-invoice-fc-learn`)
2. Left menu: **Secrets** → **+ Generate/Import**
3. Create secret:
   - **Name**: `db-password` (no spaces, lowercase)
   - **Value**: [Paste the PostgreSQL admin password you saved earlier]
   - Leave other defaults (activation dates disabled)
   - Click **Create**

> 🔐 **Learning Point**:
>
> - Using Key Vault + managed identity is the Azure-recommended way to handle secrets
> - Never hardcode passwords in app settings or source code
> - Private endpoint ensures Key Vault is only accessible from our VNet

---

## 📦 Step 6: Create Container App & Environment (Our API)

**Purpose**: Deploy our Node.js application (from GHCR) to run in Azure. In the current Azure Portal, the **Container Apps Environment** and the **Container App** are created in a single wizard — the environment is created inline on the Basics tab.

> ⚠️ **Important**: The Container Apps Environment is **not** a standalone Marketplace resource you can search for and create separately. It is created **inline** during Container App creation via the "Create new environment" link on the Basics tab. If you search the Marketplace for "Container Apps environment", you will only find "Container App", "Container App Job", and "Container App Session Pool" — none of which is the environment by itself.

### Open the Container App creation wizard

1. Go to [Azure Portal](https://portal.azure.com)
2. In the **top search bar**, search for **"Container Apps"** (plural — the service name)
3. Select the **Container Apps** service from the results → click **Create** → **Container App**

### Basics tab (creates Container App + inline Environment)

4. Fill in the Container App basics:
   - Subscription: [your sub]
   - Resource group: `rg-tax-invoice-fc-learn`
   - Container app name: `app-tax-invoice-fc-learn` (globally unique)
   - Region: Same as RG (East US)

5. In the **Container Apps environment** field, click **Create new environment** — this opens the inline environment sub-wizard:

   #### Environment sub-wizard — Basics
   - **Name**: `env-tax-invoice-fc-learn`
   - **Zone redundancy**: Leave disabled (not needed for learning)

   #### Environment sub-wizard — Monitoring
   - **Log Analytics workspace**: Select `law-tax-invoice-fc-learn` (the one we created in Step 4)

   #### Environment sub-wizard — Networking
   - **Use your own virtual network**: **Yes**
   - Virtual network: `vnet-tax-invoice-fc`
   - Subnet: `snet-tax-invoice-fc`
   - **Virtual IP**: **External** (for public ingress — Azure will provision a managed TLS certificate)

   #### Environment sub-wizard — Workload profiles
   - Skip — no need to add a dedicated profile. The default **Consumption** (Workload profiles environment) is sufficient for scale-to-zero billing.

   Click **Create** to create the environment. You'll return to the Container App Basics tab with the new environment selected.

> 🌐 **Learning Point**:
>
> - The Managed Environment is the foundational resource where Container Apps run — it defines networking, logging, and Dapr integration for all apps in it.
> - VNet integration here allows the app to privately reach the database.
> - Log Analytics connection enables app logging.
> - Dapr is **not** configured at the environment level in the portal — it's enabled per-Container-App post-create (Settings → Dapr). We don't need Dapr for this app.

### Container tab (image, resources, environment variables)

6. Uncheck the **Use quickstart image** checkbox (if pre-selected) to enable custom image settings.

7. **Image source**: **Docker Hub or other registries** (this option covers GHCR)

8. **Registry login server**: `ghcr.io`
   - **Image type**: **Private**
   - **Image and tag**: `samuel-ricardo/tax-invoice-issuer-fc:main`

9. **Registry credentials**:
   - **Username**: Your GitHub username
   - **Password**: **Generate a Personal Access Token (PAT)** from GitHub with `read:packages` scope:
     - Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token
     - Select `read:packages` scope
     - Set a 90-day expiry (or per your organization's policy). **Do not use "no expiration"** — it's a security risk.
     - Generate → **COPY THIS TOKEN** (you won't see it again)
   - Note: If the GHCR image is **public**, registry credentials may not be required.

10. **Resource allocation** (sub-section within the Container tab — this sets per-replica CPU/memory):
    - CPU: `0.25` cores (minimum — matches our architecture)
    - Memory: `0.5 Gi` (minimum — matches our architecture)

11. **Environment variables** (sub-section within the Container tab):
    - Add these as plain values for now (we'll replace the password with a Key Vault reference after deployment):
      - `NODE_ENV`: `production`
      - `PORT`: `3000`
    - The `DATABASE_PASSWORD` will be bound via a **secret reference** in the post-deploy Key Vault configuration below.

### Ingress tab

12. **Ingress**: **Enabled** (allows incoming traffic to the Container App)

13. **Accepting traffic from**: **Anywhere** (public access, suitable for learning)

14. **Ingress type**: **HTTP**

15. **Transport**: **Auto** (Azure will negotiate HTTP/1 or HTTP/2 automatically)

16. **Target port**: `3000` (this is the **container target port** — what your Node.js app listens on internally)

    > ⚠️ **Port clarification**: The Target port (`3000`) is the port your container listens on. **External** access is via **HTTPS on port 443** — Azure provisions a **managed TLS certificate** automatically and terminates TLS at the ingress. The public-facing URL uses HTTPS on the standard port.
    >
    > Leave the **Insecure connections** checkbox **unchecked** — this disables plaintext external access and forces HTTPS-only, which is the recommended default.

### Scaling tab

17. **Minimum replicas**: `0` (scale-to-zero = free when idle)
18. **Maximum replicas**: `1` (enough for learning/demo)
19. **Scale rule**:
    - Type: **HTTP**
    - Concurrent requests: `10`

### Review + create

20. Click **Review + create** → review the summary → **Create**

> ⏳ Wait for deployment (~2-3 mins)

### 🔑 Configure Secure Database Connection via Key Vault

Now we'll bind the database password and connection values to the Container App using **Key Vault references** — the Container Apps-native secrets mechanism.

> ⚠️ **Important — Container Apps secrets mechanism**: Container Apps uses a secrets model that is distinct from App Service. Do **not** look for a "Configuration → Application settings" blade with a key-vault-icon picker (that's the App Service flow). Container Apps has a dedicated **Secrets** management surface under the **Security** section of the Container App resource. Environment variables bind to secrets via `secretRef` (mirroring how the Bicep template works — see `infra_public/main.bicep` lines 129–135 and 164–165).

#### Step A: Enable system-assigned managed identity (required for Key Vault access)

1. Go to your Container App (`app-tax-invoice-fc-learn`)
2. Left menu: **Security** section → **Identity**
3. Under **System assigned**, toggle the status to **On** → **Save**
4. Note the **Object (principal) ID** — you'll need this (or the managed identity name) for the Key Vault role assignment below.

> 🔐 **Learning Point**: The system-assigned managed identity is how the Container App authenticates to Key Vault without storing any credentials. Until you enable it, the Container App cannot read Key Vault secrets via RBAC.

#### Step B: Add non-secret environment variables

1. Go to your Container App (`app-tax-invoice-fc-learn`)
2. Left menu: **Configuration** (or **Containers** → **Environment variables**, depending on portal version)
3. Add or confirm these **plain** environment variables:
   - `DATABASE_HOST`: `psql-tax-invoice-fc-learn.postgres.database.azure.com`
     _(Find this in your PostgreSQL server's Overview page → "Server name")_
   - `DATABASE_PORT`: `5432`
   - `DATABASE_USER`: `dbadmin` (the admin username we set earlier)
   - `DATABASE_NAME`: `invoicesdb` (aligns with the Bicep template — `infra_public/main.bicep` defines `databaseName = 'invoicesdb'`)
   - `NODE_ENV`: `production`
   - `PORT`: `3000`
4. Click **Save / Apply**

#### Step C: Create a Key Vault reference secret in the Container App

1. Still on your Container App (`app-tax-invoice-fc-learn`) → left menu **Security** section → **Secrets**
2. Click **+ Add** (or **Add secret**)
3. Configure the secret:
   - **Type**: **Key Vault reference**
   - **Name**: `kv-postgres-password` (this is the internal secret name the env var will bind to)
   - **Key Vault URI**: The full secret URI — for example:
     `https://kv-tax-invoice-fc-learn.vault.azure.net/secrets/db-password`
     _(To find the full URI: go to Key Vault → Secrets → `db-password` → copy the "Secret Identifier" value. The URI includes the version segment if you pick a specific version; omitting the version always resolves to the latest.)_
   - **Identity**: **System assigned** (uses the identity you enabled in Step A)
4. Click **Add** → **Save**

#### Step D: Bind the DATABASE_PASSWORD environment variable to the secret

1. Still on your Container App → left menu **Configuration** (or **Containers** → **Environment variables**)
2. Add (or edit) the `DATABASE_PASSWORD` environment variable:
   - **Name**: `DATABASE_PASSWORD`
   - **Source**: **Reference Container Apps secret** (i.e., bind via `secretRef`)
   - **Secret name**: `kv-postgres-password` (the secret you created in Step C)
3. Click **Save / Apply**

> 🔐 **Learning Point**:
>
> - The app never sees the actual password — it gets injected at runtime via the Container Apps secrets mechanism, sourced from Key Vault by the managed identity.
> - This mirrors the Bicep deployment exactly: `secrets: [{name:'kv-postgres-password', keyVaultUrl, identity:'system'}]` + `env:[{name:'DATABASE_PASSWORD', secretRef:'kv-postgres-password'}]` (see `infra_public/main.bicep` L129–135 and L164–165).
> - Container Apps does **not** use the `@Microsoft.KeyVault(...)` reference syntax — that's for App Service. Container Apps uses the `secretRef` model instead.

### 🔗 Grant Container App Access to Key Vault

1. Go to your Key Vault (`kv-tax-invoice-fc-learn`)
2. Left menu: **Access control (IAM)** → **+ Add** → **Add role assignment**
3. Role: **Key Vault Secrets User**
4. Assign access to: **Managed identity**
5. Select members:
   - Subscription: [your sub]
   - Resource group: `rg-tax-invoice-fc-learn`
   - Managed identity: `app-tax-invoice-fc-learn` (should appear as a system-assigned identity — confirming Step A enabled it)
6. Click **Review + assign** → **Review + assign**

> 🔑 **Learning Point**:
>
> - This gives the Container App permission to read secrets from Key Vault
> - Uses Azure RBAC (Role-Based Access Control) - the modern, secure way
> - No secrets or keys stored in the app or deployment process

---
