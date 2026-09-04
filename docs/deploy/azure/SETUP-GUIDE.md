# 🚀 Setup Guide — Azure Deploy

> Complete step-by-step guide to provision and configure the Azure environment from scratch.
>
> **STATUS: LEGACY — DO NOT RUN.** This guide describes
> the standard Bicep flow and old names, including historical references to
> credentials that do not belong to the current flow. The confirmed deployment uses the
> [current manual runbook](./manual/step-by-step-guide.md), with `-learn` resources,
> Azure OIDC, Key Vault, and PostgreSQL Flexible Server private access/VNet
> integration. This file is kept only as a historical record.

---

## ✅ Prerequisites

### Required Tools

```bash
# 1. Azure CLI (v2.50+)
az --version

# 2. Git
git --version

# Instalar Azure CLI (se necessário)
# Windows: winget install Microsoft.AzureCLI
# Mac:     brew install azure-cli
# Linux:   curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

### Required Accounts

- ✅ Azure account with an active subscription ([Create for free](https://azure.microsoft.com/free) — $200 credit for 30 days)
- ✅ GitHub repository: `Samuel-Ricardo/Tax-Invoice-Issuer-FC`
- ✅ `main` branch with up-to-date code

---

## 🔐 PHASE 1 — Azure Authentication

```bash
# Login interativo
az login

# Verificar subscription ativa
az account show --query "{name:name, id:id, state:state}" -o table

# Se tiver múltiplas subscriptions, selecione a correta
az account set --subscription "Nome ou ID da Subscription"
```

---

## ⚙️ PHASE 2 — Provision Infrastructure (IaC)

### Option A: Automated Script (Recommended)

```bash
# 1. Clone / vá para o repositório
cd Tax-Invoice-Issuer-FC

# 2. Defina a senha do PostgreSQL localmente antes de executar o setup
export POSTGRES_PASSWORD="<POSTGRES_PASSWORD>"

# 3. Execute o setup completo
chmod +x infra/setup-azure.sh
bash infra/setup-azure.sh
```

The script will:

- ✅ Create the Resource Group `rg-tax-invoice-fc`
- ✅ Deploy the Bicep templates (Container Apps + PostgreSQL + Log Analytics)
- ✅ Create the Service Principal for GitHub Actions
- ✅ Print the secrets you will need to configure

**Estimated time**: ~5-8 minutes

---

### Option B: Manual Deploy via CLI

If you prefer to run it step by step:

```bash
# 1. Criar Resource Group
az group create \
  --name rg-tax-invoice-fc \
  --location eastus

# 2. Deploy do Bicep
az deployment group create \
  --resource-group rg-tax-invoice-fc \
  --template-file infra/main.bicep \
  --parameters \
    containerImage="ghcr.io/samuel-ricardo/tax-invoice-issuer-fc:main" \
    postgresAdminPassword="$POSTGRES_PASSWORD" \
  --query "properties.outputs" \
  --output table
```

---

## 🔑 PHASE 3 — Configure GitHub Secrets (HISTORICAL — DO NOT RUN)

> **Historical record:** the flow below used a Service Principal with
> `AZURE_CREDENTIALS`. Do not copy, generate, or configure that secret. The current
> flow uses the `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, and
> `AZURE_SUBSCRIPTION_ID` secrets with OIDC login; see the [current runbook](./manual/step-by-step-guide.md).

The text below preserves the historical procedure for audit purposes only:

**Navigate to**: `github.com/Samuel-Ricardo/Tax-Invoice-Issuer-FC` → Settings → Secrets and variables → Actions

### Required Secrets

| Secret                  | Value                                      | How to obtain                       |
| ----------------------- | ------------------------------------------ | ----------------------------------- |
| `AZURE_CREDENTIALS`     | `<REDACTED_LEGACY_SERVICE_PRINCIPAL_JSON>` | Historical `setup-azure.sh` output  |
| `AZURE_SUBSCRIPTION_ID` | `<AZURE_SUBSCRIPTION_ID>`                  | `az account show --query id -o tsv` |

### How to create the Secret manually (historical, do not run)

```bash
# Gerar AZURE_CREDENTIALS manualmente (histórico; não executar)
az ad sp create-for-rbac \
  --name "sp-tax-invoice-fc-github" \
  --role "Contributor" \
  --scopes "/subscriptions/$(az account show --query id -o tsv)/resourceGroups/rg-tax-invoice-fc" \
  --sdk-auth
```

The historical JSON output (do not copy or paste; values omitted):

```json
{
  "clientId": "<REDACTED>",
  "clientSecret": "<REDACTED>",
  "subscriptionId": "<REDACTED>",
  "tenantId": "<REDACTED>",
  ...
}
```

---

## 🔄 PHASE 4 — First Deploy (HISTORICAL — DO NOT RUN)

> This push and the following commands belong to the legacy flow. Do not use this
> procedure for the current deployment; follow the [current runbook](./manual/step-by-step-guide.md).

With the infrastructure ready and the secrets configured:

```bash
# Fazer push para main para acionar o deploy
git push origin main
```

**Follow the deployment**:

1. Go to `github.com/Samuel-Ricardo/Tax-Invoice-Issuer-FC/actions`
2. Click the latest workflow run
3. Watch the `build` and `deploy` jobs in real time

**Estimated pipeline time**: ~3-5 minutes

---

## ✔️ PHASE 5 — Verification

### Get the API URL

```bash
az containerapp show \
  --name ca-tax-invoice-fc-api \
  --resource-group rg-tax-invoice-fc \
  --query "properties.configuration.ingress.fqdn" \
  -o tsv
```

### Smoke Test

```bash
# Substitua <FQDN> pela URL obtida acima
API_URL="https://$(az containerapp show --name ca-tax-invoice-fc-api --resource-group rg-tax-invoice-fc --query 'properties.configuration.ingress.fqdn' -o tsv)"

# Health Check
curl -s "$API_URL/" | jq .
# Esperado: {"hello": "world"}

# Testar geração de invoice
curl -s -X POST "$API_URL/invoice" \
  -H "Content-Type: application/json" \
  -d '{"month": 1, "year": 2024, "type": "cash"}' | jq .
```

---

## 🔧 Management Commands

### Monitoring

```bash
# Ver logs em tempo real
az containerapp logs show \
  --name ca-tax-invoice-fc-api \
  --resource-group rg-tax-invoice-fc \
  --follow

# Ver status do Container App
az containerapp show \
  --name ca-tax-invoice-fc-api \
  --resource-group rg-tax-invoice-fc \
  --query "{status:properties.runningStatus, replicas:properties.template.scale}" \
  -o table

# Ver uso de recursos
az monitor metrics list \
  --resource ca-tax-invoice-fc-api \
  --resource-group rg-tax-invoice-fc \
  --resource-type "Microsoft.App/containerApps" \
  --metric "CpuPercentage"
```

### PostgreSQL Management (Cost Savings)

```bash
# ⏸️  PARAR o banco (economiza ~$12/mês, paga só storage)
az postgres flexible-server stop \
  --resource-group rg-tax-invoice-fc \
  --name psql-tax-invoice-fc

# ▶️  RETOMAR o banco
az postgres flexible-server start \
  --resource-group rg-tax-invoice-fc \
  --name psql-tax-invoice-fc

# Ver status
az postgres flexible-server show \
  --resource-group rg-tax-invoice-fc \
  --name psql-tax-invoice-fc \
  --query "{name:name, state:properties.state, sku:sku.name}" \
  -o table
```

### Update the Image Manually

```bash
# Forçar update para a tag latest
az containerapp update \
  --name ca-tax-invoice-fc-api \
  --resource-group rg-tax-invoice-fc \
  --image ghcr.io/samuel-ricardo/tax-invoice-issuer-fc:main
```

---

## 🗑️ Cleanup (Remove Everything)

```bash
# ⚠️  CUIDADO: Remove TODOS os recursos e dados
az group delete \
  --name rg-tax-invoice-fc \
  --yes \
  --no-wait

echo "Resource Group marcado para deleção. Processo concluído em ~5 minutos."
```

---

## 🐛 Troubleshooting

### Problem: Container App won't start

```bash
# Ver logs de erro
az containerapp logs show \
  --name ca-tax-invoice-fc-api \
  --resource-group rg-tax-invoice-fc \
  --type system

# Verificar se a imagem existe no GHCR
# Acesse: https://github.com/Samuel-Ricardo/Tax-Invoice-Issuer-FC/pkgs/container/tax-invoice-issuer-fc
```

### Problem: PostgreSQL connection error

```bash
# Verificar se o banco está rodando
az postgres flexible-server show \
  --resource-group rg-tax-invoice-fc \
  --name psql-tax-invoice-fc \
  --query "properties.state" -o tsv
# Esperado: "Ready"

# Verificar se a DATABASE_URL está correta no secret
az containerapp secret list \
  --name ca-tax-invoice-fc-api \
  --resource-group rg-tax-invoice-fc
```

### Problem: GitHub Actions fails on deploy

```bash
# Verificar se o Service Principal tem permissão
az role assignment list \
  --assignee "sp-tax-invoice-fc-github" \
  --scope "/subscriptions/$(az account show --query id -o tsv)/resourceGroups/rg-tax-invoice-fc" \
  --output table
```

### Cold Start (API takes ~5-8s on the first request)

This is expected behavior with `minReplicas: 0`. To minimize it:

- Send a "warm-up" request before demonstrating
- Or set `minReplicas: 1` (adds ~$2-3/month)

---

## 📊 Final Verification — Checklist

```
✅ Resource Group criado: rg-tax-invoice-fc
✅ Container Apps Environment deployado: cae-tax-invoice-fc
✅ Container App rodando: ca-tax-invoice-fc-api
✅ PostgreSQL Flexible Server ativo: psql-tax-invoice-fc
✅ Histórico: GitHub Secret AZURE_CREDENTIALS configurado (não é requisito atual)
✅ GitHub Secret AZURE_SUBSCRIPTION_ID configurado
✅ Pipeline GitHub Actions passando (build + deploy)
✅ Health check respondendo: GET https://<fqdn>/
✅ Endpoint de invoice funcionando: POST https://<fqdn>/invoice
```

_Translated to English — documentation consolidation, 2026-09._
