# 🏗️ Arquitetura Azure — Tax Invoice Issuer FC

> Decisões técnicas, diagramas e justificativas para o deploy na Azure Cloud.

---

## 📐 Diagrama de Arquitetura

```
┌──────────────────────────────────────────────────────────────────┐
│                        DEVELOPER WORKFLOW                        │
│                                                                  │
│   git push origin main                                           │
│         │                                                        │
│         ▼                                                        │
│   ┌─────────────────────────────────────────┐                   │
│   │           GitHub Actions CI/CD          │                   │
│   │                                         │                   │
│   │  ① Checkout → ② npm test               │                   │
│   │  ③ docker build                        │                   │
│   │  ④ Push → ghcr.io/samuel-ricardo/...   │                   │
│   │  ⑤ az containerapp update             │                   │
│   └─────────────────────────────────────────┘                   │
└──────────────────────────────────────────────────────────────────┘
                              │
                              │ Deploy image
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│              AZURE CLOUD — Resource Group: rg-tax-invoice-fc     │
│                          Region: East US                         │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │         Container Apps Environment (cae-tax-invoice-fc)  │    │
│  │                                                          │    │
│  │  ┌──────────────────────────────────────────────────┐   │    │
│  │  │   Container App: ca-tax-invoice-fc-api            │   │    │
│  │  │                                                   │   │    │
│  │  │   Image: ghcr.io/samuel-ricardo/...               │   │    │
│  │  │   CPU: 0.25 vCPU  |  Memory: 0.5 GiB             │   │    │
│  │  │   Scale: 0 → 1 replicas (HTTP trigger)            │   │    │
│  │  │   Port: 3000                                      │   │    │
│  │  │   Ingress: External HTTPS                         │   │    │
│  │  │                                                   │   │    │
│  │  │   ENV: DATABASE_URL (secret)                      │   │    │
│  │  │        NODE_ENV=production                        │   │    │
│  │  └──────────────────┬───────────────────────────────┘   │    │
│  │                     │ Port 5432 (internal)               │    │
│  └─────────────────────┼───────────────────────────────────┘    │
│                         │                                        │
│  ┌──────────────────────▼───────────────────────────────────┐   │
│  │   PostgreSQL Flexible Server: psql-tax-invoice-fc        │   │
│  │                                                          │   │
│  │   SKU: Standard_B1ms (1 vCPU, 2 GiB RAM)                │   │
│  │   Version: PostgreSQL 15                                 │   │
│  │   Storage: 32 GiB                                        │   │
│  │   Backup: 7 days  |  HA: Disabled                       │   │
│  │   SSL: Required                                          │   │
│  │                                                          │   │
│  │   ⚡ Stop/Start: pausa quando não usar                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │   Log Analytics Workspace: law-tax-invoice-fc            │   │
│  │   Retenção: 30 dias  |  Free: 5GB/day ingestion          │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
                    ┌─────────────────┐
                    │    🌍 Internet   │
                    │  (Recruiters,   │
                    │   Portfolio)    │
                    └─────────────────┘
```

---

## 🔄 Fluxo CI/CD Detalhado

```mermaid
flowchart TD
    A[git push origin main] --> B[GitHub Actions Trigger]

    B --> C[Job: build]
    C --> C1[Checkout code]
    C1 --> C2[Setup Docker Buildx]
    C2 --> C3[Login GHCR]
    C3 --> C4[Extract Docker metadata\ntags + labels]
    C4 --> C5[docker build + push\nghcr.io/samuel-ricardo/tax-invoice-issuer-fc:main]
    C5 --> C6[Sign image with Cosign]

    C6 --> D{Push to main?}
    D -->|Yes| E[Job: deploy]
    D -->|No - PR| Z[End - build only]

    E --> E1[Azure Login\nAZURE_CREDENTIALS secret]
    E1 --> E2[az containerapp update\nnova imagem]
    E2 --> E3[✅ Deploy concluído\nAPI atualizada em ~30s]
```

---

## 🧱 Recursos Azure — Detalhamento

### 1. Azure Container Apps Environment

**Recurso**: `Microsoft.App/managedEnvironments`  
**Nome**: `cae-tax-invoice-fc`

O ambiente é o contexto de execução compartilhado para Container Apps. Neste projeto há apenas 1 app, mas o ambiente pode escalar para múltiplos serviços.

**Integração com Log Analytics**: todos os logs do container são enviados automaticamente.

---

### 2. Container App (API)

**Recurso**: `Microsoft.App/containerApps`  
**Nome**: `ca-tax-invoice-fc-api`

| Configuração  | Valor                    | Motivo                                         |
| ------------- | ------------------------ | ---------------------------------------------- |
| CPU           | 0.25 vCPU                | Mínimo suportado — portfolio tem baixo tráfego |
| Memória       | 0.5 GiB                  | Suficiente para Node.js Express                |
| Min replicas  | **0**                    | Scale-to-zero = custo $0 em idle               |
| Max replicas  | 1                        | 1 instância é suficiente para portfolio        |
| Scale trigger | HTTP (10 req concurrent) | Sobe quando chega tráfego                      |
| Ingress       | External + HTTPS         | URL pública com TLS automático                 |

**URL pública**: `https://ca-tax-invoice-fc-api.<random>.eastus.azurecontainerapps.io`

#### Gestão de Secrets

A connection string do PostgreSQL é armazenada como **Container Apps Secret** (built-in, criptografado, sem custo adicional). Nunca aparece em logs ou variáveis de ambiente visíveis.

```
Secret name: database-url
Value: postgresql://pgadmin:***@psql-tax-invoice-fc.postgres.database.azure.com:5432/invoicesdb?sslmode=require
Referenciado como env var: DATABASE_URL
```

---

### 3. PostgreSQL Flexible Server

**Recurso**: `Microsoft.DBforPostgreSQL/flexibleServers`  
**Nome**: `psql-tax-invoice-fc`

| Configuração         | Valor         | Motivo                                        |
| -------------------- | ------------- | --------------------------------------------- |
| SKU                  | Standard_B1ms | Menor tier disponível (1 vCPU, 2 GiB)         |
| Tier                 | Burstable     | CPU burst quando necessário, barato em idle   |
| Versão               | PostgreSQL 15 | LTS estável                                   |
| Storage              | 32 GiB        | Mínimo razoável                               |
| HA                   | Disabled      | Portfolio não precisa de alta disponibilidade |
| Geo-redundant backup | Disabled      | Economia de custo                             |
| SSL                  | Required      | Segurança obrigatória                         |

**Firewall**: regra `AllowAllAzureIPs` (0.0.0.0 → 0.0.0.0) permite que o Container Apps acesse o banco. Não expõe para a internet pública (apenas IPs internos Azure).

---

### 4. Log Analytics Workspace

**Recurso**: `Microsoft.OperationalInsights/workspaces`  
**Nome**: `law-tax-invoice-fc`

Coleta logs de todos os containers automaticamente. Permite queries via Azure Portal para debug.

```kusto
// Ver logs da API
ContainerAppConsoleLogs_CL
| where ContainerAppName_s == "ca-tax-invoice-fc-api"
| project TimeGenerated, Log_s
| order by TimeGenerated desc
| take 50
```

---

## 🔐 Decisões de Segurança (ADR)

### ADR-001: GitHub Container Registry vs Azure Container Registry

**Decisão**: Usar `ghcr.io` (GHCR)  
**Motivo**: Gratuito para repositórios públicos, integração nativa com GitHub Actions via `GITHUB_TOKEN` sem secrets adicionais. ACR Basic custa ~$5/mês desnecessariamente para portfolio.

### ADR-002: Scale-to-Zero para API

**Decisão**: `minReplicas: 0`  
**Motivo**: Portfolio tem tráfego eventual (recrutadores, demos). Com scale-to-zero, o custo em idle é $0. Cold start de 3-8s é aceitável neste contexto.

### ADR-003: PostgreSQL B1ms vs Azure Free (sem opção free)

**Decisão**: Usar B1ms com Stop/Start  
**Motivo**: Não existe tier gratuito permanente para PostgreSQL na Azure. B1ms a $12.41/mês é o menor SKU. Com Stop/Start manual, paga apenas storage (~$0.37/mês) quando parado.

### ADR-004: Bicep vs Terraform vs ARM

**Decisão**: Azure Bicep  
**Motivo**: Nativo Azure (sem dependências externas), sintaxe mais limpa que ARM JSON, Microsoft-first. Para portfolio Azure, Bicep demonstra mais senioridade que Terraform para contextos Azure-only.

---

## 🌐 Conectividade

```
Internet → Azure Front Door (built-in no Container Apps) → Container App → PostgreSQL
                                                                              (internal only)
```

- Container App expõe porta 3000 via HTTPS (443) com TLS automático
- PostgreSQL **não** tem ingress externo — acessível apenas dentro da Azure
- Conexão Container App → PostgreSQL usa SSL obrigatório (`sslmode=require`)
