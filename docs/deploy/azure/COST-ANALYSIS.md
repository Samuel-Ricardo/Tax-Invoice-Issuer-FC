# 💰 Análise de Custos Azure — Tax Invoice Issuer FC

> Análise detalhada de custos com preços validados diretamente na documentação oficial da Microsoft.
> Otimizado para projeto de portfolio com budget de **~$50/mês**.

---

## 📊 Resumo Executivo

| Cenário                              | Custo/mês | Quando usar                                |
| ------------------------------------ | --------- | ------------------------------------------ |
| **Portfolio ativo** (demonstrando)   | ~$15/mês  | Período de busca de emprego / entrevistas  |
| **Portfolio pausado** (banco parado) | ~$2/mês   | Banco parado, API em scale-to-zero         |
| **Orçamento total disponível**       | $50/mês   | —                                          |
| **Margem de segurança**              | ~$35/mês  | Outros projetos, domínio customizado, etc. |

---

## 🔍 Detalhamento por Serviço

### 1. Azure Container Apps (Consumption Plan)

**Preço validado**: [azure.microsoft.com/en-us/pricing/details/container-apps](https://azure.microsoft.com/en-us/pricing/details/container-apps/)

| Recurso              | Free Tier (por subscription/mês) | Preço após free |
| -------------------- | -------------------------------- | --------------- |
| vCPU-seconds (ativo) | 180.000 vCPU-s                   | $0.000024/s     |
| GiB-seconds (ativo)  | 360.000 GiB-s                    | $0.000003/s     |
| Requests             | 2.000.000 req                    | $0.40/milhão    |

#### Cálculo para Portfolio

Nossa configuração: 0.25 vCPU + 0.5 GiB, scale-to-zero.

**Cenário realista** (5 visitas/dia de recrutadores, ~30s de uso ativo/visita):

- Tempo ativo/mês: 5 visitas × 30s × 30 dias = 4.500 segundos
- vCPU consumidos: 4.500 × 0.25 = **1.125 vCPU-s** (free tier: 180.000)
- GiB consumidos: 4.500 × 0.5 = **2.250 GiB-s** (free tier: 360.000)
- Requests: ~500/mês (free tier: 2.000.000)

**Resultado: $0.00/mês** — 100% dentro do free tier. ✅

---

### 2. Azure Database for PostgreSQL Flexible Server

**Preço validado**: [azure.microsoft.com/en-us/pricing/details/postgresql/flexible-server](https://azure.microsoft.com/en-us/pricing/details/postgresql/flexible-server/)

| SKU                  | vCPU | RAM   | Preço/mês  |
| -------------------- | ---- | ----- | ---------- |
| **B1ms (escolhido)** | 1    | 2 GiB | **$12.41** |
| B2ms                 | 2    | 8 GiB | $99.28     |
| B2s                  | 2    | 4 GiB | $49.64     |

**Storage**: $0.115/GiB/mês

- 32 GiB configurados = **$3.68/mês** (incluído no preço do servidor)

#### Economia com Stop/Start

Quando o banco está **parado** (`Stopped` state), você paga apenas pelo storage:

| Estado                 | Custo                   |
| ---------------------- | ----------------------- |
| Running (B1ms)         | $12.41/mês              |
| **Stopped**            | ~$3.68/mês (só storage) |
| **Economia ao pausar** | ~$8.73/mês (~70%)       |

```bash
# Pausar antes de dormir / quando não estiver demonstrando
az postgres flexible-server stop \
  --resource-group rg-tax-invoice-fc \
  --name psql-tax-invoice-fc
```

---

### 3. GitHub Container Registry (GHCR)

| Tipo                | Custo     |
| ------------------- | --------- |
| Repositório público | **$0.00** |
| Storage (público)   | **$0.00** |
| Transfer (público)  | **$0.00** |

Não há custo para imagens em repositórios públicos no GitHub. ✅

---

### 4. GitHub Actions

| Tipo                | Custo                         |
| ------------------- | ----------------------------- |
| Repositório público | **$0.00**                     |
| Minutes limit       | Unlimited para repos públicos |

Não há custo para CI/CD em repositórios públicos no GitHub. ✅

---

### 5. Log Analytics Workspace

| Recurso        | Free Tier      | Custo após   |
| -------------- | -------------- | ------------ |
| Data ingestion | 5 GB/dia       | $2.30/GB     |
| Data retention | 31 dias grátis | $0.10/GB/mês |

**Para portfolio**: geração de logs muito abaixo de 5 GB/dia. **Custo: $0.00/mês** ✅

---

## 💵 Planilha de Custos

### Cenário 1: Portfolio Ativo (recomendado para período de entrevistas)

| Serviço                     | Custo/mês       | Notas            |
| --------------------------- | --------------- | ---------------- |
| Azure Container Apps        | $0.00           | Free tier        |
| PostgreSQL B1ms (running)   | $12.41          | Banco ativo 24/7 |
| Storage PostgreSQL (32 GiB) | Incluso         | No preço do B1ms |
| GHCR                        | $0.00           | Repo público     |
| GitHub Actions              | $0.00           | Repo público     |
| Log Analytics               | $0.00           | Free tier        |
| **TOTAL**                   | **~$12–13/mês** |                  |

---

### Cenário 2: Portfolio Pausado (economia máxima)

| Serviço              | Custo/mês   | Notas                             |
| -------------------- | ----------- | --------------------------------- |
| Azure Container Apps | $0.00       | Scale-to-zero                     |
| PostgreSQL (stopped) | ~$3.68      | Apenas storage (32 GiB × $0.115)  |
| GHCR                 | $0.00       | —                                 |
| GitHub Actions       | $0.00       | —                                 |
| **TOTAL**            | **~$4/mês** | Banco pode ser retomado em ~2 min |

---

### Cenário 3: Com Domínio Customizado (opcional)

Se quiser usar um domínio próprio (`api.meuportfolio.com`):

| Item                    | Custo                                |
| ----------------------- | ------------------------------------ |
| Azure DNS Zone          | ~$0.50/mês                           |
| Domínio (ex: Namecheap) | ~$1/mês                              |
| SSL                     | $0.00 (automático no Container Apps) |
| **Adicional**           | **~$1.50/mês**                       |

---

## 📈 Comparação com Alternativas

| Plataforma                  | Setup       | Custo/mês | Impressão Portfolio         |
| --------------------------- | ----------- | --------- | --------------------------- |
| **Azure Container Apps** ✅ | IaC + CI/CD | ~$12-15   | ⭐⭐⭐⭐⭐ Enterprise cloud |
| Railway                     | Simples     | ~$5-10    | ⭐⭐⭐ Startup friendly     |
| Render                      | Simples     | ~$7-14    | ⭐⭐⭐ Startup friendly     |
| Heroku                      | Simples     | ~$7-25    | ⭐⭐ Legado                 |
| AWS EC2 t3.micro            | Complexo    | ~$8-15    | ⭐⭐⭐⭐ Enterprise         |
| GCP Cloud Run               | Médio       | ~$0-5     | ⭐⭐⭐⭐ Enterprise         |
| DigitalOcean                | Médio       | ~$6-12    | ⭐⭐⭐ Startup              |

**Por que Azure vale o investimento?** Avanade, Accenture, Microsoft Partners e a maioria das grandes empresas brasileiras usam Azure. Demonstrar domínio da plataforma + Bicep + Container Apps diferencia candidatos.

---

## 🧮 Calculadora de Custo Personalizada

Acesse a calculadora oficial: [azure.microsoft.com/en-us/pricing/calculator](https://azure.microsoft.com/en-us/pricing/calculator/?services=container-apps,postgresql)

Serviços para adicionar:

- Container Apps (Consumption)
- Azure Database for PostgreSQL (Flexible Server, B1ms, East US)

---

## 💡 Dicas de Economia

1. **Use `az postgres flexible-server stop`** quando não estiver demonstrando — economiza ~$8/mês
2. **Mantenha `minReplicas: 0`** no Container App — economiza ~$2-3/mês vs `minReplicas: 1`
3. **Não use Azure Container Registry** — GHCR é gratuito para repos públicos e já está configurado
4. **Desative geo-redundant backup** no PostgreSQL — já configurado como `Disabled`
5. **Desative High Availability** no PostgreSQL — já configurado como `Disabled`
6. **Use East US** como região — geralmente os preços mais baixos na Azure

---

## 📅 Estimativa Anual

| Cenário                        | Custo/mês | Custo/ano |
| ------------------------------ | --------- | --------- |
| Ativo o ano todo               | ~$13      | ~$156     |
| Ativo 6 meses, pausado 6 meses | ~$8.5     | ~$102     |
| Pausado (só storage)           | ~$4       | ~$48      |

Dentro do seu budget de $50/mês, há espaço confortável para manter o projeto ativo sem preocupações.
