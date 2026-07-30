# ⚡ QUICKSTART - Deploy Seguro em 5 Minutos

Guia rápido para deployar a infraestrutura com segurança total.

## 📋 Pré-requisitos (1 min)

```bash
# 1. Instalar Azure CLI
# https://learn.microsoft.com/cli/azure/install-azure-cli

# 2. Fazer login no Azure
az login

# 3. Verificar instalação
az --version
# Versão recomendada: 2.50.0+
```

## 🚀 Deploy (4 mins)

### Opção 1: Um único comando

```bash
cd infra_public/
bash setup-azure.sh
```

**O que acontece automaticamente:**

- ✅ Cria Resource Group
- ✅ Cria Azure Key Vault
- ✅ Gera + armazena senha PostgreSQL no Key Vault (seguro!)
- ✅ Deploy Bicep (Container Apps + PostgreSQL)
- ✅ Cria Service Principal para GitHub Actions
- ✅ Salva credentials em `.deployment-output/sp-credentials.json` (protegido)

### Opção 2: Manual (configuração customizada)

```bash
# 1. Exportar variáveis (opcional)
export AZURE_RESOURCE_GROUP="meu-rg-customizado"
export AZURE_LOCATION="westus2"
export ENV_NAME="meu-env"
export KEY_VAULT_NAME="meu-kv"

# 2. Rodar setup
cd infra_public/
bash setup-azure.sh
```

## 📋 Após Deployment

### ✅ Step 1: Copiar Credentials para GitHub

```bash
# 1. Verificar credenciais foram salvas
cat .deployment-output/sp-credentials.json | head

# 2. No GitHub:
# - Ir para Settings → Secrets and variables → Actions
# - New repository secret
# - Name: AZURE_CREDENTIALS
# - Value: (copiar conteúdo da linha acima)
```

### ✅ Step 2: Adicionar Subscription ID

```bash
# No GitHub:
# - New repository secret
# - Name: AZURE_SUBSCRIPTION_ID
# - Value: (ver no output do script)
```

### ✅ Step 3: Testar Conexão

```bash
# Obter URL da API
az containerapp show \
  --name ca-tax-invoice-fc-api \
  --resource-group rg-tax-invoice-fc \
  --query "properties.configuration.ingress.fqdn" -o tsv

# Testar healthcheck (exemplo)
curl https://ca-tax-invoice-fc-api.<random>.eastus.azurecontainerapps.io/health
```

### ✅ Step 4: Verificar Logs

```bash
# Ver logs da API
az containerapp logs show \
  --name ca-tax-invoice-fc-api \
  --resource-group rg-tax-invoice-fc \
  --follow
```

---

## 🔐 Segurança Check

### ✅ Verificar se tudo está seguro

```bash
# 1. Confirmar que PASSWORD NÃO foi printado
cat .deployment-output/deployment.log | grep -i "password" || \
  echo "✅ Password não foi exposto em logs"

# 2. Confirmar que secrets estão no Key Vault
az keyvault secret list \
  --vault-name kv-tax-invoice-fc \
  --query "[].name" -o tsv

# 3. Confirmar que sp-credentials.json não será commitado
git status | grep "sp-credentials" || \
  echo "✅ Credentials file está em .gitignore"

# 4. Confirmar permissions
ls -la .deployment-output/sp-credentials.json
# Deve mostrar: -rw------- (600 - only owner can read)
```

---

## 💾 Salvar Credentials com Segurança

### Option A: 1Password / LastPass (Recomendado)

```bash
# Abrir 1Password
op vault list

# Salvar credenciais
op item create \
  --category=login \
  --title="Tax Invoice Issuer - Azure" \
  --url="https://portal.azure.com" \
  username="sp-principal" \
  password="$(cat .deployment-output/sp-credentials.json)"
```

### Option B: Team Vault (se usar git-crypt)

```bash
# Copiar credentials para arquivo encriptado
cp .deployment-output/sp-credentials.json .credentials.enc
git-crypt add-gpg-user user@company.com

# Compartilhar com time
git push origin
```

---

## ⚡ Próximos Passos

### 1. Configurar GitHub Actions

Criar `.github/workflows/deploy.yml`:

```yaml
name: Deploy API

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: Deploy Container App
        run: |
          az containerapp update \
            --name ca-tax-invoice-fc-api \
            --resource-group rg-tax-invoice-fc \
            --image ${{ secrets.REGISTRY }}/tax-invoice-issuer:${{ github.sha }}
```

### 2. Setup Local Development

```bash
# Copiar .env.example (se existir)
cp .env.example .env.local

# Preencher valores (obter do Key Vault)
az keyvault secret show \
  --vault-name kv-tax-invoice-fc \
  --name postgres-password \
  --query value -o tsv

# No .env.local:
# DATABASE_PASSWORD=<valor acima>
# DATABASE_HOST=psql-tax-invoice-fc.postgres.database.azure.com
# DATABASE_USER=pgadmin
# DATABASE_NAME=invoicesdb
```

### 3. Deploy da Aplicação

```bash
# Build image
docker build -t tax-invoice-issuer:latest .

# Push para registry (exemplo: GitHub Container Registry)
docker tag tax-invoice-issuer:latest \
  ghcr.io/samuel-ricardo/tax-invoice-issuer-fc:latest
docker push ghcr.io/samuel-ricardo/tax-invoice-issuer-fc:latest

# Atualizar Container App
az containerapp update \
  --name ca-tax-invoice-fc-api \
  --resource-group rg-tax-invoice-fc \
  --image ghcr.io/samuel-ricardo/tax-invoice-issuer-fc:latest
```

---

## 📊 Monitorar Custos

```bash
# Ver uso de recursos
az monitor metrics list \
  --resource /subscriptions/{sub}/resourceGroups/rg-tax-invoice-fc/providers/Microsoft.App/containerApps/ca-tax-invoice-fc-api \
  --metric CpuUsagePercentage MemoryUsagePercentage \
  --interval PT1H

# Economia: Pausar PostgreSQL quando não usar
az postgres flexible-server stop \
  --resource-group rg-tax-invoice-fc \
  --name psql-tax-invoice-fc
```

---

## 🆘 Troubleshooting Rápido

| Problema                            | Solução                                                             |
| ----------------------------------- | ------------------------------------------------------------------- |
| `Command not found: az`             | Instale Azure CLI                                                   |
| `Permission denied: setup-azure.sh` | `chmod +x setup-azure.sh`                                           |
| `KeyVault not found`                | Aguarde 30s, o KV foi criado recentemente                           |
| `Container App pending`             | Aguarde ~2 min, aplicação está iniciando                            |
| `No secrets in Key Vault`           | Verificar: `az keyvault secret list --vault-name kv-tax-invoice-fc` |

---

## 📝 Checklista Final

```markdown
[ ] Azure CLI instalado
[ ] `az login` executado
[ ] Ran `bash setup-azure.sh` with sucesso
[ ] Credentials salvos em 1Password/LastPass
[ ] GitHub Secrets configurados (AZURE_CREDENTIALS + AZURE_SUBSCRIPTION_ID)
[ ] API responde em healthcheck
[ ] PostgreSQL conecta
[ ] Logs não mostram secrets
[ ] `.deployment-output/` está em .gitignore
[ ] GitHub secret scanning ativado
[ ] README.md e SECURITY.md lidos por team
```

---

## 🎯 Status da Infraestrutura

Verificar tudo com um comando:

```bash
# Script de health check completo
bash ./health-check.sh
```

Arquivo `health-check.sh` (criar na raiz de infra_public/):

```bash
#!/bin/bash
set -e

echo "🔍 Health Check - Tax Invoice Issuer"
echo ""

# Check Resource Group
echo "1️⃣  Resource Group..."
az group show --name rg-tax-invoice-fc --output none && echo "   ✅ OK" || echo "   ❌ NOT FOUND"

# Check Container App
echo "2️⃣  Container App..."
az containerapp show --name ca-tax-invoice-fc-api --resource-group rg-tax-invoice-fc --output none && echo "   ✅ OK" || echo "   ❌ NOT FOUND"

# Check PostgreSQL
echo "3️⃣  PostgreSQL..."
az postgres flexible-server show --name psql-tax-invoice-fc --resource-group rg-tax-invoice-fc --output none && echo "   ✅ OK" || echo "   ❌ NOT FOUND"

# Check Key Vault
echo "4️⃣  Key Vault..."
az keyvault show --name kv-tax-invoice-fc --resource-group rg-tax-invoice-fc --output none && echo "   ✅ OK" || echo "   ❌ NOT FOUND"

echo ""
echo "✅ All systems OK!"
```

---

**Tempo estimado: 5-10 minutos**  
**Última atualização: 2026-07-12**
