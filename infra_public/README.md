# Tax-Invoice-Issuer-FC — Azure Infrastructure (Public Version)

Infraestrutura como Código (IaC) para deploy seguro no Azure usando Bicep.

## 🔐 Segurança

**IMPORTANTE**: Esta é a versão **PUBLIC** da infraestrutura. Todos os secrets e credenciais sensíveis são:

- ✅ Armazenados no **Azure Key Vault** (não no git)
- ✅ Injetados em **runtime** nas aplicações
- ✅ **NUNCA** commitados no repositório
- ✅ Gerenciados via **Managed Identity** (sem SDK auth)

**NÃO EXISTA** um arquivo `infra/` neste repositório:

- Se estiver vendo um, é porque está sendo executado **localmente**
- O `infra/` está em `.gitignore` e contém dados sensíveis
- Use `infra_public/` para deploy público

---

## 📋 Arquitetura

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

### Pré-requisitos

- **Azure CLI** instalado (`az cli`)
- **Logged in**: `az login`
- **Bicep CLI**: instalado automaticamente com Azure CLI v2.3+
- **jq**: para parsear JSON (para shell script)

```bash
# Verificar instalação
az --version
az bicep version
```

### Rápido Start

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

**Saída esperada:**

```
✅ SETUP CONCLUÍDO!

🌐 API URL: https://ca-tax-invoice-fc-api.<random>.eastus.azurecontainerapps.io
🗄️  PostgreSQL Host: psql-tax-invoice-fc.postgres.database.azure.com
🐳 Container App: ca-tax-invoice-fc-api

🔐 Secrets de forma SEGURA:
   PostgreSQL Password: Armazenado no Key Vault
   GitHub Actions Credentials: Salvo em .deployment-output/sp-credentials.json
```

---

## 🔐 Gerenciamento de Secrets

### Arquitetura de Segurança

1. **Azure Key Vault** armazena todas as credenciais
2. **Container Apps** usa **Managed Identity** para acessar Key Vault
3. **Variáveis de ambiente** recebem secrets em runtime (não hardcoded)
4. **Nenhum secret é printado** em logs ou terminal

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
console.log(secret.value);
```

#### Java / Spring Boot

```properties
# application.properties
spring.datasource.username=${DB_USER:postgres}
spring.datasource.password=${DATABASE_PASSWORD}
spring.datasource.url=jdbc:postgresql://${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}?sslmode=require
```

#### GitHub Actions (CI/CD)

```yaml
- name: Deploy to Azure
  uses: azure/login@v1
  with:
    creds: ${{ secrets.AZURE_CREDENTIALS }}

- name: Get secret from Key Vault
  run: |
    az keyvault secret show \
      --vault-name ${{ secrets.KEY_VAULT_NAME }} \
      --name postgres-password
```

---

## 📝 Customização

### Mudando Parâmetros

Edite `main.parameters.json`:

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

Ou passe como variáveis de ambiente:

```bash
export AZURE_LOCATION="westus2"
export CONTAINER_IMAGE="your-image:tag"
bash setup-azure.sh
```

### Escalar Container App

```bash
az containerapp update \
  --name ca-tax-invoice-fc-api \
  --resource-group rg-tax-invoice-fc \
  --min-replicas 1 \
  --max-replicas 3
```

### Pausar PostgreSQL (Economia)

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

## 🧪 Testando a Infraestrutura

### 1. Verificar Deploy Status

```bash
az deployment group show \
  --resource-group rg-tax-invoice-fc \
  --name main
```

### 2. Testar Conectividade ao PostgreSQL

```bash
# Do seu computador com az cli
psql -h psql-tax-invoice-fc.postgres.database.azure.com \
     -U pgadmin \
     -d invoicesdb
```

### 3. Monitorar Logs da API

```bash
az containerapp logs show \
  --name ca-tax-invoice-fc-api \
  --resource-group rg-tax-invoice-fc
```

### 4. Healthcheck da API

```bash
# Substituir URL pela sua
curl https://ca-tax-invoice-fc-api.<random>.eastus.azurecontainerapps.io/health
```

---

## ⚠️ Segurança: Checklist

### Antes de Fazer Deploy

- [ ] Nenhuma senha é hardcoded (verificar `main.bicep`)
- [ ] Key Vault está ativado
- [ ] Container App tem Managed Identity habilitada
- [ ] Firewall do PostgreSQL permite apenas Azure services

### Depois de Deploy

- [ ] Testar conexão do app ao PostgreSQL
- [ ] Verificar logs por erros de conexão
- [ ] Confirmar que secrets **não aparecem em logs**
- [ ] Adicionar GitHub Secrets para CI/CD

### Para CI/CD (GitHub Actions)

```bash
# 1. Salvar credenciais do Service Principal
cat .deployment-output/sp-credentials.json

# 2. No GitHub:
# Settings → Secrets and variables → Actions
# New secret: AZURE_CREDENTIALS
# Value: (conteúdo do arquivo acima)

# 3. New secret: AZURE_SUBSCRIPTION_ID
# Value: seu-subscription-id

# 4. New secret: AZURE_RESOURCE_GROUP
# Value: rg-tax-invoice-fc

# ❌ NUNCA commitar sp-credentials.json
# ✅ Está em .gitignore e .deployment-output/
```

---

## 📊 Custo Estimado

| Serviço         | Custo       | Notas                       |
| --------------- | ----------- | --------------------------- |
| Container Apps  | $0          | Scale-to-zero quando idle   |
| PostgreSQL B1ms | $12.41/mês  | Pode pausar para poupar 95% |
| Log Analytics   | $0          | Free tier (5GB/day)         |
| Key Vault       | $0.60/mês   | $0.60 por 10k operações     |
| **Total**       | **$13/mês** | Pode reduzir pausando DB    |

---

## 🐛 Troubleshooting

### Erro: "Invalid Key Vault ID"

```
Error: The Resource 'Microsoft.KeyVault/vaults/...' under resource group 'rg-...' was not found.
```

**Solução**: Key Vault não foi criado. Verifique:

```bash
az keyvault show --name kv-tax-invoice-fc -g rg-tax-invoice-fc
```

### Erro: "PostgreSQL connection refused"

```
Error connecting to database
```

**Solução**: Verificar credenciais no Key Vault:

```bash
az keyvault secret show \
  --vault-name kv-tax-invoice-fc \
  --name postgres-password
```

### Container App não inicia

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

## 🗑️ Cleanup (Remover Tudo)

```bash
# ⚠️ Isto DELETA toda a infraestrutura
az group delete \
  --name rg-tax-invoice-fc \
  --yes \
  --no-wait

echo "✅ Resource Group agendado para deleção"
```

---

## 📚 Referências

- [Azure Bicep Docs](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/)
- [Container Apps Docs](https://learn.microsoft.com/en-us/azure/container-apps/)
- [Azure Key Vault Docs](https://learn.microsoft.com/en-us/azure/key-vault/)
- [PostgreSQL Flexible Server](https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/)

---

## 📝 License

MIT — Veja LICENSE na raiz do repositório

---

## 🤝 Contribuindo

1. **Nunca** commitar secrets ou credenciais
2. **Sempre** usar Key Vault para dados sensíveis
3. Testar em resource group de dev antes de produção
4. Seguir padrão SOLID e clean code

---

**Última atualização**: 2026-07-12  
**Versão**: 1.0.0 (Public)
