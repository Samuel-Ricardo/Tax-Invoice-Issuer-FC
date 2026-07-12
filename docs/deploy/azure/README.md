# ☁️ Azure Cloud Deployment — Tax Invoice Issuer FC

> Deploy completo na Azure Cloud com **Container Apps + PostgreSQL Flexible Server**.
> Otimizado para portfolio: custo ~$12–15/mês, scale-to-zero, CI/CD automático via GitHub Actions.

---

## 📋 Índice desta Seção

| Documento                                   | Audiência        | Tempo de Leitura |
| ------------------------------------------- | ---------------- | ---------------- |
| **[Arquitetura](./ARCHITECTURE.md)**        | Arquitetos, Devs | 10 min           |
| **[Guia de Setup](./SETUP-GUIDE.md)**       | DevOps, Devs     | 15 min           |
| **[Análise de Custos](./COST-ANALYSIS.md)** | Tech Leads, PMs  | 5 min            |

---

## 🎯 Visão Geral

### O que está sendo deployado

```
Tax-Invoice-Issuer-FC
├── API (Node.js 25 + Express + TypeScript)
└── Banco de Dados (PostgreSQL 15)
```

### Onde está deployado

```
Azure Cloud (East US)
├── Azure Container Apps       → API (serverless, scale-to-zero)
└── PostgreSQL Flexible Server → Banco (Burstable B1ms)
```

### Como o CI/CD funciona

```
git push main → GitHub Actions → Build + Test → Push GHCR → Deploy Container Apps
```

---

## 🏗️ Stack de Infraestrutura

| Camada              | Serviço Azure                       | Justificativa                  |
| ------------------- | ----------------------------------- | ------------------------------ |
| **Compute**         | Azure Container Apps (Consumption)  | Scale-to-zero = $0 em idle     |
| **Database**        | PostgreSQL Flexible Server B1ms     | Menor SKU + Stop/Start         |
| **Registry**        | GitHub Container Registry (ghcr.io) | Gratuito para repos públicos   |
| **CI/CD**           | GitHub Actions                      | Gratuito para repos públicos   |
| **Observabilidade** | Log Analytics Workspace             | Free tier 5GB/day              |
| **IaC**             | Azure Bicep                         | Nativo Azure, sem dependências |

---

## ⚡ Quick Deploy

```bash
# Pré-requisito: Azure CLI instalado e logado
az login

# Deploy completo em 1 comando (~5 min)
POSTGRES_PASSWORD="SuaSenhaSegura123!" bash infra/setup-azure.sh
```

Após o setup, cada `git push origin main` faz deploy automático.

---

## 📁 Estrutura de Arquivos

```
Tax-Invoice-Issuer-FC/
├── infra/
│   ├── main.bicep              # IaC: todos os recursos Azure
│   ├── main.parameters.json    # Parâmetros do deploy
│   └── setup-azure.sh          # Script de setup automatizado
│
├── .github/
│   └── workflows/
│       └── docker-publish.yaml # CI/CD: build + deploy
│
└── docs/deploy/azure/          # ← Você está aqui
    ├── README.md               # Este arquivo
    ├── ARCHITECTURE.md         # Diagrama e decisões técnicas
    ├── SETUP-GUIDE.md          # Passo a passo completo
    └── COST-ANALYSIS.md        # Análise de custos detalhada
```

---

## 🔗 Links Rápidos

- [Azure Portal](https://portal.azure.com)
- [Azure Container Apps Docs](https://learn.microsoft.com/en-us/azure/container-apps/)
- [PostgreSQL Flexible Server Docs](https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/)
- [GitHub Container Registry Docs](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
