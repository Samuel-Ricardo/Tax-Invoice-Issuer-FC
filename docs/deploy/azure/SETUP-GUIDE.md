# 🚀 Setup Guide — Deploy Azure

> Guia passo a passo completo para provisionar e configurar o ambiente Azure do zero.

---

## ✅ Pré-requisitos

### Ferramentas Necessárias

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

### Contas Necessárias

- ✅ Conta Azure com subscription ativa ([Criar grátis](https://azure.microsoft.com/free) — $200 crédito por 30 dias)
- ✅ Repositório GitHub: `Samuel-Ricardo/Tax-Invoice-Issuer-FC`
- ✅ Branch `main` com código atualizado

---

## 🔐 FASE 1 — Autenticação Azure

```bash
# Login interativo
az login

# Verificar subscription ativa
az account show --query "{name:name, id:id, state:state}" -o table

# Se tiver múltiplas subscriptions, selecione a correta
az account set --subscription "Nome ou ID da Subscription"
```

---

## ⚙️ FASE 2 — Provisionar Infraestrutura (IaC)

### Opção A: Script Automatizado (Recomendado)

```bash
# 1. Clone / vá para o repositório
cd Tax-Invoice-Issuer-FC

# 2. Defina a senha do PostgreSQL localmente antes de executar o setup
export POSTGRES_PASSWORD="<POSTGRES_PASSWORD>"

# 3. Execute o setup completo
chmod +x infra/setup-azure.sh
bash infra/setup-azure.sh
```

O script irá:

- ✅ Criar o Resource Group `rg-tax-invoice-fc`
- ✅ Fazer deploy do Bicep (Container Apps + PostgreSQL + Log Analytics)
- ✅ Criar o Service Principal para GitHub Actions
- ✅ Imprimir os secrets que você precisará configurar

**Tempo estimado**: ~5-8 minutos

---

### Opção B: Deploy Manual via CLI

Se preferir executar passo a passo:

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

## 🔑 FASE 3 — Configurar GitHub Secrets

Após o setup, você terá o JSON do Service Principal. Agora configure os secrets no GitHub:

**Navegue para**: `github.com/Samuel-Ricardo/Tax-Invoice-Issuer-FC` → Settings → Secrets and variables → Actions

### Secrets Necessários

| Secret                  | Valor                     | Como obter                          |
| ----------------------- | ------------------------- | ----------------------------------- |
| `AZURE_CREDENTIALS`     | JSON do Service Principal | Saída do `setup-azure.sh`           |
| `AZURE_SUBSCRIPTION_ID` | ID da sua subscription    | `az account show --query id -o tsv` |

### Como criar o Secret manualmente (se necessário)

```bash
# Gerar AZURE_CREDENTIALS manualmente
az ad sp create-for-rbac \
  --name "sp-tax-invoice-fc-github" \
  --role "Contributor" \
  --scopes "/subscriptions/$(az account show --query id -o tsv)/resourceGroups/rg-tax-invoice-fc" \
  --sdk-auth
```

O output JSON (cole inteiro no secret `AZURE_CREDENTIALS`):

```json
{
  "clientId": "...",
  "clientSecret": "...",
  "subscriptionId": "...",
  "tenantId": "...",
  ...
}
```

---

## 🔄 FASE 4 — Primeiro Deploy

Com a infraestrutura pronta e os secrets configurados:

```bash
# Fazer push para main para acionar o deploy
git push origin main
```

**Acompanhar o deploy**:

1. Acesse `github.com/Samuel-Ricardo/Tax-Invoice-Issuer-FC/actions`
2. Clique no último workflow run
3. Veja os jobs `build` e `deploy` em tempo real

**Tempo estimado do pipeline**: ~3-5 minutos

---

## ✔️ FASE 5 — Verificação

### Obter a URL da API

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

## 🔧 Comandos de Gestão

### Monitoramento

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

### Gestão do PostgreSQL (Economia de Custo)

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

### Atualizar Imagem Manualmente

```bash
# Forçar update para a tag latest
az containerapp update \
  --name ca-tax-invoice-fc-api \
  --resource-group rg-tax-invoice-fc \
  --image ghcr.io/samuel-ricardo/tax-invoice-issuer-fc:main
```

---

## 🗑️ Cleanup (Remover tudo)

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

### Problema: Container App não inicia

```bash
# Ver logs de erro
az containerapp logs show \
  --name ca-tax-invoice-fc-api \
  --resource-group rg-tax-invoice-fc \
  --type system

# Verificar se a imagem existe no GHCR
# Acesse: https://github.com/Samuel-Ricardo/Tax-Invoice-Issuer-FC/pkgs/container/tax-invoice-issuer-fc
```

### Problema: Erro de conexão com PostgreSQL

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

### Problema: GitHub Actions falha no deploy

```bash
# Verificar se o Service Principal tem permissão
az role assignment list \
  --assignee "sp-tax-invoice-fc-github" \
  --scope "/subscriptions/$(az account show --query id -o tsv)/resourceGroups/rg-tax-invoice-fc" \
  --output table
```

### Cold Start (API demora ~5-8s no primeiro request)

Isso é comportamento esperado com `minReplicas: 0`. Para minimizar:

- Faça um request de "aquecimento" antes de demonstrar
- Ou configure `minReplicas: 1` (adiciona ~$2-3/mês)

---

## 📊 Verificação Final — Checklist

```
✅ Resource Group criado: rg-tax-invoice-fc
✅ Container Apps Environment deployado: cae-tax-invoice-fc
✅ Container App rodando: ca-tax-invoice-fc-api
✅ PostgreSQL Flexible Server ativo: psql-tax-invoice-fc
✅ GitHub Secret AZURE_CREDENTIALS configurado
✅ GitHub Secret AZURE_SUBSCRIPTION_ID configurado
✅ Pipeline GitHub Actions passando (build + deploy)
✅ Health check respondendo: GET https://<fqdn>/
✅ Endpoint de invoice funcionando: POST https://<fqdn>/invoice
```
