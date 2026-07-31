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

## 🏗️ Step 6: Create Container Apps Environment

**Purpose**: The foundational environment for our Container Apps (networking, logging, monitoring).

1. In RG, click **+ Create**
2. Search for "Container Apps environment" → Select → **Create**
3. **Basics tab**:
   - Subscription: [your sub]
   - Resource group: `rg-tax-invoice-fc-learn`
   - Name: `env-tax-invoice-fc-learn`
   - Region: Same as RG
4. **Networking tab**:
   - **Connect to an existing virtual network**: **Yes**
   - Virtual network: `vnet-tax-invoice-fc`
   - Subnet: `snet-tax-invoice-fc` (same subnet as DB)
   - **Enable Dapr**: **No** (not needed for this app)
5. **Monitoring tab**:
   - **Connect to Log Analytics workspace**: **Yes**
   - Log analytics workspace: `law-tax-invoice-fc-learn` (the one we created)
   - Leave other defaults
6. Click **Review + create** → **Create**

> 🌐 **Learning Point**:
>
> - This creates a managed environment where our Container App will run
> - VNet integration here allows the app to privately reach the database
> - Log Analytics connection enables app logging

---

## 📦 Step 7: Create Container App (Our API)

**Purpose**: Deploy our Node.js application (from GHCR) to run in Azure.

1. In RG, click **+ Create**
2. Search for "Container App" → Select → **Create**
3. **Basics tab**:
   - Subscription: [your sub]
   - Resource group: `rg-tax-invoice-fc-learn`
   - Container app name: `app-tax-invoice-fc-learn` (globally unique)
   - Region: Same as RG
   - Environment: `env-tax-invoice-fc-learn` (select the one we created)
4. **Container tab**:
   - Image source: **Container Registry** (other options: Docker Hub, ACR)
   - Server: `ghcr.io`
   - Image name: `samuel-ricardo/tax-invoice-issuer-fc`
   - Tag: `main`
   - **Credentials**:
     - Username: Your GitHub username
     - Password: [Generate a **Personal Access Token** (PAT) from GitHub with `read:packages` scope]
       - Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token
       - Select `read:packages`, no expiration, generate → **COPY THIS TOKEN**
   - Click **+ Add container** (if not already visible)
5. **Ingress tab**:
   - **Allow incoming traffic**: **Yes**
   - Traffic: **HTTP**
   - Port: `3000` (matches our Dockerfile EXPOSE)
   - **Allow insecure connections**: **No** (HTTPS only - Azure provides managed cert)
6. **Scaling tab**:
   - Minimum replicas: `0` (scale-to-zero = free when idle)
   - Maximum replicas: `1` (enough for learning/demo)
   - Scale rule:
     - Type: **HTTP**
     - Concurrent requests: `10`
   - Leave other defaults
7. **Resources tab** (per replica):
   - CPU: `0.25` cores
   - Memory: `0.5 Gi` (matches our architecture)
8. **Environment variables tab**:
   - We'll set these in the next step via Key Vault references
   - For now, add these as plain values (we'll replace with KV references later):
     - `NODE_ENV`: `production`
     - `PORT`: `3000`
9. Click **Review + create** → **Create**

> ⏳ Wait for deployment (~2-3 mins)

### 🔑 Configure Secure Database Connection via Key Vault

Now we'll replace the plain DB connection with a secure Key Vault reference.

1. Go to your Container App (`app-tax-invoice-fc-learn`)
2. Left menu: **Configuration** → **Application settings** tab
3. **Add these key-value pairs**:
   - **Name**: `DATABASE_HOST`
     - **Value**: `psql-tax-invoice-fc-learn.postgres.database.azure.com`
       _(Find this in your PostgreSQL server's Overview page → "Server name")_
   - **Name**: `DATABASE_PORT`
     - **Value**: `5432`
   - **Name**: `DATABASE_USER`
     - **Value**: `dbadmin` (the admin username we set earlier)
   - **Name**: `DATABASE_NAME`
     - **Value**: `tax_invoice_db` (or whatever you prefer; matches our app's expectation)
   - **Name**: `DATABASE_PASSWORD`
     - **Value**:
       - Click the **Key Vault reference** icon (looks like a key)
       - Subscription: [your sub]
       - Resource group: `rg-tax-invoice-fc-learn`
       - Key vault: `kv-tax-invoice-fc-learn`
       - Secret: `db-password` (the one we created)
       - Click **Select**
   - **Name**: `NODE_ENV`
     - **Value**: `production`
   - **Name**: `PORT`
     - **Value**: `3000`
4. Click **Apply** at top

> 🔐 **Learning Point**:
>
> - The app never sees the actual password - it gets injected at runtime from Key Vault
> - This requires the Container App's **managed identity** to have access to Key Vault
> - We'll set that up next

### 🔗 Grant Container App Access to Key Vault

1. Go to your Key Vault (`kv-tax-invoice-fc-learn`)
2. Left menu: **Access control (IAM)** → **+ Add** → **Add role assignment**
3. Role: **Key Vault Secrets User**
4. Assign access to: **Managed identity**
5. Select members:
   - Subscription: [your sub]
   - Resource group: `rg-tax-invoice-fc-learn`
   - Managed identity: `app-tax-invoice-fc-learn` (should appear as a system-assigned identity)
6. Click **Review + assign** → **Review + assign**

> 🔑 **Learning Point**:
>
> - This gives the Container App permission to read secrets from Key Vault
> - Uses Azure RBAC (Role-Based Access Control) - the modern, secure way
> - No secrets or keys stored in the app or deployment process

---

## 🧪 Step 8: Test the Deployment

Let's verify our application is working.

1. Go to your Container App (`app-tax-invoice-fc-learn`)
2. Left menu: **Overview**
3. Find the **Application URL** (looks like `https://app-tax-invoice-fc-learn.<random>.westeurope.azurecontainerapps.io`)
4. Click the link or copy/paste into a new browser tab
5. You should see: `{"hello":"world"}`
6. Test the invoice endpoint:
   - Append `/invoice` to the URL: `https://.../invoice`
   - Use a tool like [curl](https://curl.se/) or [Postman](https://www.postman.com/) to POST:
     ```bash
     curl -X POST https://app-tax-invoice-fc-learn.<random>.westeurope.azurecontainerapps.io/invoice \
       -H "Content-Type: application/json" \
       -d '{"month":1,"year":2024,"type":"cash"}'
     ```
   - Expected response: JSON array with invoice amount (e.g., `[{"date":"2024-01-15T00:00:00.000Z","amount":1500.5}]`)

> ✅ **Success**: If you get a JSON response, your app is connected to the database via Key Vault!
>
> 🔍 **Troubleshooting Tips**:
>
> - Check **Container App → Logs** (streaming) for errors
> - Verify Key Vault access: App's managed identity must have "Key Vault Secrets User" role
> - Confirm PostgreSQL firewall: Should be **private endpoint only** (no public access)
> - Ensure VNet/subnet matches between DB, Key Vault, and Container App Environment

---

## 📝 Step 9: Explore & Learn (Optional but Recommended)

### View Logs in Log Analytics

1. Go to your Log Analytics workspace (`law-tax-invoice-fc-learn`)
2. Left menu: **Logs**
3. Run a query to see app logs:
   ```kusto
   ContainerAppConsoleLogs_CL
   | where ContainerAppName_s == "app-tax-invoice-fc-learn"
   | order by TimeGenerated desc
   | limit 20
   ```

### Check Database Connection (Advanced)

> ⚠️ Only do this if you have a local PostgreSQL client and want to verify VNet connectivity

1. Deploy a jumpbox VM in the same VNet (not covered here for simplicity)
2. Or use Azure Cloud Shell with `psql` installed:
   ```bash
   az postgres flexible-server connect --name psql-tax-invoice-fc-learn --resource-group rg-tax-invoice-fc-learn
   ```
3. Then run: `\dt` to see tables (our app creates `invoices` on startup)

---

## 🗑️ Cleanup (When Done Learning)

To avoid unexpected charges:

1. Go to your Resource Group: `rg-tax-invoice-fc-learn`
2. Click **Delete resource group**
3. Type the resource group name to confirm
4. Click **Delete**

> 💡 **Alternative**: Delete resources individually if you want to keep some for further experimentation.

---

## 🎓 Key Learning Takeaways

| Concept                   | What You Learned                                                             |
| ------------------------- | ---------------------------------------------------------------------------- |
| **Resource Groups**       | Logical boundary for lifecycle management                                    |
| **Virtual Networks**      | Foundation for private, secure Azure networking                              |
| **Private Endpoints**     | How to keep PaaS services (DB, KV) off the public internet                   |
| **Managed Identities**    | Secure way for Azure services to authenticate to other services (no secrets) |
| **Key Vault**             | Centralized secret management with access policies                           |
| **Container Apps**        | Serverless containers with scale-to-zero, built-in networking, and logging   |
| **Environment Variables** | How to configure apps securely in Azure (avoiding hardcoded values)          |
| **Observability**         | Centralized logging with Log Analytics for debugging                         |
| **Dependency Order**      | Why we create resources in this sequence (network → DB → KV → Env → App)     |

## 🔗 Next Steps for Automation

Once you're comfortable with the manual process:

1. Compare this to the existing Bicep template (`infra_public/main.bicep`)
2. Automate using Azure CLI or Azure PowerShell
3. Implement CI/CD with GitHub Actions (see `.github/workflows/docker-publish.yaml`)
4. Explore advanced features: custom domains, autoscaling rules, backup policies

---

> 📚 **Remember**: The goal isn't just to get it working—it's to understand **why** each step is necessary and how the pieces fit together. Take time to read the tooltips in Azure Portal and check the "Learn more" links.

Happy learning on Azure! ☁️
