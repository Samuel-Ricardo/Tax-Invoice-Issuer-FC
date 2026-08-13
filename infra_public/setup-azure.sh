#!/bin/bash
# ============================================================
# Tax-Invoice-Issuer-FC — Azure Setup Script (PUBLIC VERSION)
# Provisiona toda a infraestrutura com 1 comando
# Pré-requisito: az cli instalado e logado (az login)
# 
# SECURITY: Este script não printa secrets. Consulte a documentação
# em README.md para instruções de segurança completas.
# ============================================================

set -e

# ── Configuração ────────────────────────────────────────────
SUBSCRIPTION_ID="${AZURE_SUBSCRIPTION_ID:-$(az account show --query id -o tsv)}"
RESOURCE_GROUP="${AZURE_RESOURCE_GROUP:-rg-tax-invoice-fc}"
LOCATION="${AZURE_LOCATION:-eastus}"
ENV_NAME="${ENV_NAME:-tax-invoice-fc}"
CONTAINER_IMAGE="${CONTAINER_IMAGE:-ghcr.io/samuel-ricardo/tax-invoice-issuer-fc:main}"
KEY_VAULT_NAME="${KEY_VAULT_NAME:-kv-${ENV_NAME}}"

# Diretórios
INFRA_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_DIR="${INFRA_DIR}/.deployment-output"
CREDENTIALS_FILE="${OUTPUT_DIR}/sp-credentials.json"
DEPLOYMENT_LOG="${OUTPUT_DIR}/deployment.log"

echo "📋 Verificando configuração..."
echo "  Subscription: $SUBSCRIPTION_ID"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  Location: $LOCATION"
echo "  Key Vault: $KEY_VAULT_NAME"
echo ""

# ── Criar diretório de output ────────────────────────────────
mkdir -p "$OUTPUT_DIR"
chmod 700 "$OUTPUT_DIR"  # Private directory for secrets

# ── 1. Resource Group ────────────────────────────────────────
echo "1️⃣  Criando Resource Group..."
az group create \
  --name "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --output none

echo "   ✅ $RESOURCE_GROUP criado"

# ── 2. Key Vault ─────────────────────────────────────────────
echo ""
echo "2️⃣  Criando Azure Key Vault..."

az keyvault create \
  --name "$KEY_VAULT_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --output none

echo "   ✅ Key Vault criado"

# ── 3. Gerar e armazenar PostgreSQL password ─────────────────
echo ""
echo "3️⃣  Gerando e armazenando senha PostgreSQL no Key Vault..."

POSTGRES_PASSWORD="$(openssl rand -base64 24)"

az keyvault secret set \
  --vault-name "$KEY_VAULT_NAME" \
  --name "postgres-password" \
  --value "$POSTGRES_PASSWORD" \
  --output none

echo "   ✅ Senha PostgreSQL armazenada com segurança no Key Vault"

# ── 4. Obter Key Vault ID ───────────────────────────────────
KEY_VAULT_ID=$(az keyvault show \
  --name "$KEY_VAULT_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query "id" -o tsv)

# ── 5. Deploy Bicep ─────────────────────────────────────────
echo ""
echo "4️⃣  Fazendo deploy da infraestrutura (Bicep)..."
echo "   ⏳ Aguarde ~3-5 minutos..."

az deployment group create \
  --resource-group "$RESOURCE_GROUP" \
  --template-file "${INFRA_DIR}/main.bicep" \
  --parameters \
    location="$LOCATION" \
    envName="$ENV_NAME" \
    containerImage="$CONTAINER_IMAGE" \
    keyVaultId="$KEY_VAULT_ID" \
    postgresPasswordSecretName="postgres-password" \
  --output json > "${DEPLOYMENT_LOG}"

echo "   ✅ Deploy concluído!"

# ── 6. Extrair outputs (safe - sem secrets) ─────────────────
API_URL=$(jq -r '.properties.outputs.apiUrl.value' "${DEPLOYMENT_LOG}")
POSTGRES_HOST=$(jq -r '.properties.outputs.postgresHost.value' "${DEPLOYMENT_LOG}")
CONTAINER_APP_NAME=$(jq -r '.properties.outputs.containerAppName.value' "${DEPLOYMENT_LOG}")

# ── 7. Service Principal para GitHub Actions ─────────────────
echo ""
echo "5️⃣  Criando Service Principal para GitHub Actions..."

SP_OUTPUT=$(az ad sp create-for-rbac \
  --name "sp-tax-invoice-fc-github-$(date +%s)" \
  --role "Contributor" \
  --scopes "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP" \
  --sdk-auth)

# Salvar em arquivo seguro (não printa)
echo "$SP_OUTPUT" > "$CREDENTIALS_FILE"
chmod 600 "$CREDENTIALS_FILE"  # Read/write only for owner

echo "   ✅ Service Principal criado"

# ── 8. Resultado Final ───────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════════════"
echo "✅ SETUP CONCLUÍDO!"
echo "════════════════════════════════════════════════════════"
echo ""
echo "🌐 API URL: $API_URL"
echo "🗄️  PostgreSQL Host: $POSTGRES_HOST"
echo "🐳 Container App: $CONTAINER_APP_NAME"
echo ""
echo "📁 Arquivos de configuração gerados em:"
echo "   ${OUTPUT_DIR}/"
echo ""
echo "🔐 Secrets de forma SEGURA:"
echo ""
echo "   PostgreSQL Password:"
echo "   → Armazenado no Key Vault: ${KEY_VAULT_NAME}/secrets/postgres-password"
echo "   → NUNCA commitar este valor"
echo ""
echo "   GitHub Actions Credentials:"
echo "   → Salvo em: ${CREDENTIALS_FILE}"
echo "   → ⚠️  NÃO COMMITAR este arquivo"
echo "   → Adicione em GitHub:"
echo "      Settings → Secrets and variables → Actions → New repository secret"
echo "      Secret: AZURE_CREDENTIALS"
echo "      Value: (copie conteúdo de ${CREDENTIALS_FILE})"
echo ""
echo "   Subscription ID:"
echo "   → ${SUBSCRIPTION_ID}"
echo "   → Adicione em GitHub Secrets como AZURE_SUBSCRIPTION_ID"
echo ""
echo "💾 Próximos passos:"
echo "   1. Cat ${CREDENTIALS_FILE} (APENAS em seu computador)"
echo "   2. Copie e adicione como GitHub Secret: AZURE_CREDENTIALS"
echo "   3. Adicione AZURE_SUBSCRIPTION_ID: ${SUBSCRIPTION_ID}"
echo ""
echo "💡 DICA DE ECONOMIA:"
echo "   Pause o PostgreSQL quando não estiver usando:"
echo "   az postgres flexible-server stop \\"
echo "     --resource-group $RESOURCE_GROUP \\"
echo "     --name psql-$ENV_NAME"
echo "   (Economiza ~$12/mês)"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   - Este script gerou um arquivo ${CREDENTIALS_FILE}"
echo "   - Este arquivo está em .gitignore e NUNCA deve ser commitado"
echo "   - Use APENAS em seu ambiente local ou CI/CD protegido"
echo ""
