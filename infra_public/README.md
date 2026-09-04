# Tax-Invoice-Issuer-FC — Azure Infrastructure (Public Version)

> **Legacy/non-current infrastructure documentation — current as of 2026-08-25.**
> This Bicep/IaC material is retained for historical context and does not
> provision the current `-learn` topology. Use the [current Azure runbook](../docs/deploy/azure/manual/step-by-step-guide.md)
> and [Azure overview](../docs/deploy/azure/README.md) instead.
> _Translated to English as part of the 2026 documentation consolidation._

Infrastructure as Code (IaC) for secure deployment on Azure using Bicep.

## 🔐 Security

**IMPORTANT**: This is the **PUBLIC** version of the infrastructure. All sensitive secrets and credentials are:

- ✅ Stored in **Azure Key Vault** (not in git)
- ✅ Injected at **runtime** into the applications
- ✅ **NEVER** committed to the repository
- ✅ Managed via **Managed Identity** (no SDK auth)

There must be **NO** `infra/` directory in this repository:

- If you see one, it is because it is being run **locally**
- `infra/` is in `.gitignore` and contains sensitive data
- Use `infra_public/` for public deployment

---

## 📋 Architecture

```
┌─────────────────────────────────────────────────────┐
│              Container Apps (scale to 0)            │
│  - Node.js API (Tax Invoice Issuer)                 │
│  - Replicas: 0-1 (free when idle)                   │
└──────────────────────┬──────────────────────────────┘
                       │ TLS
┌──────────────────────▼──────────────────────────────┐
│        PostgreSQL 15 Flexible Server B1ms           │
│  - Storage: 32 GB                                   │
│  - Backup: 7 days retention                         │
│  - Cost: ~$12/month (can pause to save 95%)         │
└─────────────────────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │   Azure Key Vault            │
        │  - postgres-password         │
        │  - database-connection-url   │
        │  - (other secrets as needed) │
        └──────────────────────────────┘

        ┌──────────────────────────────┐
        │  Log Analytics Workspace     │
        │  - Free 5GB/day ingestion    │
        │  - 30-day retention          │
        └──────────────────────────────┘
```

---

## 🚀 Deployment

### Prerequisites

- **Azure CLI** installed (`az cli`)
- **Logged in**: `az login`
- **Bicep CLI**: installed automatically with Azure CLI v2.3+
- **jq**: to parse JSON (for the shell script)

```bash
# Verificar instalação
az --version
az bicep version
```

### Quick Start

```bash
# 1. Clone e abra a pasta infra_public
cd infra_public/

# 2. Configure variáveis de ambiente (opcional)
export AZURE_SUBSCRIPTION_ID="your-sub-id"
export AZURE_RESOURCE_GROUP="rg-tax-invoice-fc"
export AZURE_LOCATION="eastus"
export ENV_NAME="tax-invoice-fc"
export CONTAINER_IMAGE="ghcr.io/samuel-ricardo/tax-invoice-issuer-fc:main"
export KEY_VAULT_NAME="kv-tax-invoice-fc"

# 3. Execute o setup script
bash setup-azure.sh

# ⏳ Aguarde ~5 minutos para conclusão
```

**Expected historical output:**

> This block describes the output of the legacy setup. Do not copy credentials or treat
> these names as current resources; use the [current runbook](../docs/deploy/azure/manual/step-by-step-guide.md).

```
✅ SETUP CONCLUÍDO!

🌐 API URL: https://ca-tax-invoice-fc-api.<random>.eastus.azurecontainerapps.io
🗄️  PostgreSQL Host: psql-tax-invoice-fc.postgres.database.azure.com
🐳 Container App: ca-tax-invoice-fc-api

🔐 Secrets de forma SEGURA:
   PostgreSQL Password: Armazenado no Key Vault
   GitHub Actions Credentials: Salvo localmente (conteúdo não exibido)
```

---

## 🔐 Secrets Management

### Security Architecture

1. **Azure Key Vault** stores all credentials
2. **Container Apps** uses **Managed Identity** to access Key Vault
3. **Environment variables** receive secrets at runtime (not hardcoded)
4. **No secret is printed** to logs or the terminal

### Accessing Secrets Programmatically

#### Node.js

```javascript
// Usar Azure Identity + Key Vault Secret Client
const { SecretClient } = require("@azure/keyvault-secrets");
const { DefaultAzureCredential } = require("@azure/identity");

const credential = new DefaultAzureCredential();
const client = new SecretClient(
  `https://${process.env.KEY_VAULT_NAME}.vault.azure.net/`,
  credential,
);

const secret = await client.getSecret("postgres-password");
// Never print secret.value; pass it only to approved runtime configuration.
```

#### Java / Spring Boot

```properties
# application.properties
spring.datasource.username=${DB_USER:postgres}
spring.datasource.password=${DATABASE_PASSWORD}
spring.datasource.url=jdbc:postgresql://${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}?sslmode=require
```

#### GitHub Actions (CI/CD) — HISTORICAL — DO NOT RUN

> The example below uses the old Service Principal login. The current workflow
> uses Azure OIDC and does not use `AZURE_CREDENTIALS`.

```yaml
- name: Deploy to Azure
  uses: azure/login@v1
  with:
    # Historical credential flow; secret reference intentionally omitted.

- name: Get secret from Key Vault
  run: |
    az keyvault secret show \
      --vault-name ${{ secrets.KEY_VAULT_NAME }} \
      --name postgres-password
```

---

## 📝 Customization

### Changing Parameters

Edit `main.parameters.json`:

```json
{
  "parameters": {
    "location": {
      "value": "brazilsouth" // Mudar região
    },
    "containerImage": {
      "value": "your-registry.azurecr.io/tax-invoice:v2" // Seu registry
    }
  }
}
```

Or pass them as environment variables:

```bash
export AZURE_LOCATION="westus2"
export CONTAINER_IMAGE="your-image:tag"
bash setup-azure.sh
```

### Scale Container App

```bash
az containerapp update \
  --name ca-tax-invoice-fc-api \
  --resource-group rg-tax-invoice-fc \
  --min-replicas 1 \
  --max-replicas 3
```

### Pause PostgreSQL (Savings)

```bash
# Pausa (economiza ~$12/mês, paga só storage)
az postgres flexible-server stop \
  --resource-group rg-tax-invoice-fc \
  --name psql-tax-invoice-fc

# Retomar
az postgres flexible-server start \
  --resource-group rg-tax-invoice-fc \
  --name psql-tax-invoice-fc
```

---

## 🧪 Testing the Infrastructure

### 1. Check Deployment Status

```bash
az deployment group show \
  --resource-group rg-tax-invoice-fc \
  --name main
```

### 2. Test PostgreSQL Connectivity

```bash
# Do seu computador com az cli
psql -h psql-tax-invoice-fc.postgres.database.azure.com \
     -U pgadmin \
     -d invoicesdb
```

### 3. Monitor API Logs

```bash
az containerapp logs show \
  --name ca-tax-invoice-fc-api \
  --resource-group rg-tax-invoice-fc
```

### 4. API Healthcheck

```bash
# Substituir URL pela sua
curl https://ca-tax-invoice-fc-api.<random>.eastus.azurecontainerapps.io/health
```

---

## ⚠️ Security: Checklist

### Before Deploying

- [ ] No password is hardcoded (check `main.bicep`)
- [ ] Key Vault is enabled
- [ ] Container App has Managed Identity enabled
- [ ] PostgreSQL firewall allows only Azure services

### After Deploying

- [ ] Test the app connection to PostgreSQL
- [ ] Check logs for connection errors
- [ ] Confirm that secrets **do not appear in logs**
- [ ] Add GitHub Secrets for CI/CD

### For CI/CD (GitHub Actions) — HISTORICAL — DO NOT RUN

> The current flow uses OIDC. The name `AZURE_CREDENTIALS` below is kept only
> as a historical reference and must not be created or populated.

```bash
# 1. Salvar credenciais do Service Principal
# Do not print .deployment-output/sp-credentials.json; verify it exists only.
test -s .deployment-output/sp-credentials.json

# 2. No GitHub:
# Settings → Secrets and variables → Actions
# Historical secret reference: AZURE_CREDENTIALS (not current deployment; value omitted)

# 3. New secret: AZURE_SUBSCRIPTION_ID
# Value: seu-subscription-id

# 4. New secret: AZURE_RESOURCE_GROUP
# Value: rg-tax-invoice-fc

# ❌ NUNCA commitar sp-credentials.json
# ✅ Está em .gitignore e .deployment-output/
```

---

## 📊 Estimated Cost

| Service         | Cost          | Notes                            |
| --------------- | ------------- | -------------------------------- |
| Container Apps  | $0            | Scale-to-zero when idle          |
| PostgreSQL B1ms | $12.41/month  | Can be paused to save 95%        |
| Log Analytics   | $0            | Free tier (5GB/day)              |
| Key Vault       | $0.60/month   | $0.60 per 10k operations         |
| **Total**       | **$13/month** | Can be reduced by pausing the DB |

---

## 🐛 Troubleshooting

### Error: "Invalid Key Vault ID"

```
Error: The Resource 'Microsoft.KeyVault/vaults/...' under resource group 'rg-...' was not found.
```

**Solution**: The Key Vault was not created. Check:

```bash
az keyvault show --name kv-tax-invoice-fc -g rg-tax-invoice-fc
```

### Error: "PostgreSQL connection refused"

```
Error connecting to database
```

**Solution**: Check the credentials in Key Vault:

```bash
az keyvault secret show \
  --vault-name kv-tax-invoice-fc \
  --name postgres-password
```

### Container App does not start

```bash
# Ver logs detalhados
az containerapp logs show \
  --name ca-tax-invoice-fc-api \
  --resource-group rg-tax-invoice-fc \
  --follow

# Verificar configuração
az containerapp show \
  --name ca-tax-invoice-fc-api \
  --resource-group rg-tax-invoice-fc \
  --output json | jq '.properties.template.containers[0].env'
```

---

## 🗑️ Cleanup (Remove Everything)

```bash
# ⚠️ Isto DELETA toda a infraestrutura
az group delete \
  --name rg-tax-invoice-fc \
  --yes \
  --no-wait

echo "✅ Resource Group agendado para deleção"
```

---

## 📚 References

- [Azure Bicep Docs](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/)
- [Container Apps Docs](https://learn.microsoft.com/en-us/azure/container-apps/)
- [Azure Key Vault Docs](https://learn.microsoft.com/en-us/azure/key-vault/)
- [PostgreSQL Flexible Server](https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/)

---

## 📝 License

MIT — See LICENSE at the repository root

---

## 🤝 Contributing

1. **Never** commit secrets or credentials
2. **Always** use Key Vault for sensitive data
3. Test in a dev resource group before production
4. Follow SOLID principles and clean code

---

**Last updated**: 2026-07-12
**Version**: 1.0.0 (Public)
