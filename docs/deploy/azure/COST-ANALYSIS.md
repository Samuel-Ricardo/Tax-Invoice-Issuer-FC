# 💰 Azure Cost Analysis — Tax Invoice Issuer FC

> Detailed cost analysis with prices validated directly against official Microsoft documentation.
> Optimized for a portfolio project with a budget of **~$50/month**.
>
> **Status: Historical — not a current estimate of the deployment.** The values
> below use outdated assumptions, including region, names, and storage capacity.
> Use the [current manual runbook](./manual/step-by-step-guide.md) for the confirmed
> topology, and validate prices, quotas, and consumption in the official calculator
> before making any cost decisions.

---

## 📊 Executive Summary

| Scenario                                | Cost/month | When to use                            |
| --------------------------------------- | ---------- | -------------------------------------- |
| **Active portfolio** (demonstrating)    | ~$15/month | Job-hunting period / interviews        |
| **Paused portfolio** (database stopped) | ~$2/month  | Database stopped, API in scale-to-zero |
| **Total available budget**              | $50/month  | —                                      |
| **Safety margin**                       | ~$35/month | Other projects, custom domain, etc.    |

---

## 🔍 Breakdown by Service

### 1. Azure Container Apps (Consumption Plan)

**Validated price**: [azure.microsoft.com/en-us/pricing/details/container-apps](https://azure.microsoft.com/en-us/pricing/details/container-apps/)

| Resource              | Free Tier (per subscription/month) | Price after free |
| --------------------- | ---------------------------------- | ---------------- |
| vCPU-seconds (active) | 180,000 vCPU-s                     | $0.000024/s      |
| GiB-seconds (active)  | 360,000 GiB-s                      | $0.000003/s      |
| Requests              | 2,000,000 req                      | $0.40/million    |

#### Calculation for the Portfolio

Our configuration: 0.25 vCPU + 0.5 GiB, scale-to-zero.

**Realistic scenario** (5 recruiter visits/day, ~30s of active use per visit):

- Active time/month: 5 visits × 30s × 30 days = 4,500 seconds
- vCPU consumed: 4,500 × 0.25 = **1,125 vCPU-s** (free tier: 180,000)
- GiB consumed: 4,500 × 0.5 = **2,250 GiB-s** (free tier: 360,000)
- Requests: ~500/month (free tier: 2,000,000)

**Result: $0.00/month** — 100% within the free tier. ✅

---

### 2. Azure Database for PostgreSQL Flexible Server

**Validated price**: [azure.microsoft.com/en-us/pricing/details/postgresql/flexible-server](https://azure.microsoft.com/en-us/pricing/details/postgresql/flexible-server/)

| SKU               | vCPU | RAM   | Price/month |
| ----------------- | ---- | ----- | ----------- |
| **B1ms (chosen)** | 1    | 2 GiB | **$12.41**  |
| B2ms              | 2    | 8 GiB | $99.28      |
| B2s               | 2    | 4 GiB | $49.64      |

**Storage**: $0.115/GiB/month

- 32 GiB configured = **$3.68/month** (included in the server price)

#### Savings with Stop/Start

When the database is **stopped** (`Stopped` state), you pay only for storage:

| State                   | Cost                        |
| ----------------------- | --------------------------- |
| Running (B1ms)          | $12.41/month                |
| **Stopped**             | ~$3.68/month (storage only) |
| **Savings when paused** | ~$8.73/month (~70%)         |

```bash
# Pausar antes de dormir / quando não estiver demonstrando
az postgres flexible-server stop \
  --resource-group rg-tax-invoice-fc \
  --name psql-tax-invoice-fc
```

---

### 3. GitHub Container Registry (GHCR)

| Type              | Cost      |
| ----------------- | --------- |
| Public repository | **$0.00** |
| Storage (public)  | **$0.00** |
| Transfer (public) | **$0.00** |

There is no cost for images in public repositories on GitHub. ✅

---

### 4. GitHub Actions

| Type              | Cost                       |
| ----------------- | -------------------------- |
| Public repository | **$0.00**                  |
| Minutes limit     | Unlimited for public repos |

There is no cost for CI/CD on public repositories on GitHub. ✅

---

### 5. Log Analytics Workspace

| Resource       | Free Tier    | Cost after     |
| -------------- | ------------ | -------------- |
| Data ingestion | 5 GB/day     | $2.30/GB       |
| Data retention | 31 days free | $0.10/GB/month |

**For a portfolio**: log generation is far below 5 GB/day. **Cost: $0.00/month** ✅

---

## 💵 Cost Spreadsheet

### Scenario 1: Active Portfolio (recommended during interview periods)

| Service                     | Cost/month        | Notes                |
| --------------------------- | ----------------- | -------------------- |
| Azure Container Apps        | $0.00             | Free tier            |
| PostgreSQL B1ms (running)   | $12.41            | Database active 24/7 |
| PostgreSQL Storage (32 GiB) | Included          | In the B1ms price    |
| GHCR                        | $0.00             | Public repo          |
| GitHub Actions              | $0.00             | Public repo          |
| Log Analytics               | $0.00             | Free tier            |
| **TOTAL**                   | **~$12–13/month** |                      |

---

### Scenario 2: Paused Portfolio (maximum savings)

| Service              | Cost/month    | Notes                          |
| -------------------- | ------------- | ------------------------------ |
| Azure Container Apps | $0.00         | Scale-to-zero                  |
| PostgreSQL (stopped) | ~$3.68        | Storage only (32 GiB × $0.115) |
| GHCR                 | $0.00         | —                              |
| GitHub Actions       | $0.00         | —                              |
| **TOTAL**            | **~$4/month** | Database can resume in ~2 min  |

---

### Scenario 3: With Custom Domain (optional)

If you want to use your own domain (`api.meuportfolio.com`):

| Item                     | Cost                                |
| ------------------------ | ----------------------------------- |
| Azure DNS Zone           | ~$0.50/month                        |
| Domain (e.g., Namecheap) | ~$1/month                           |
| SSL                      | $0.00 (automatic on Container Apps) |
| **Additional**           | **~$1.50/month**                    |

---

## 📈 Comparison with Alternatives

| Platform                    | Setup       | Cost/month | Portfolio Impression        |
| --------------------------- | ----------- | ---------- | --------------------------- |
| **Azure Container Apps** ✅ | IaC + CI/CD | ~$12-15    | ⭐⭐⭐⭐⭐ Enterprise cloud |
| Railway                     | Simple      | ~$5-10     | ⭐⭐⭐ Startup friendly     |
| Render                      | Simple      | ~$7-14     | ⭐⭐⭐ Startup friendly     |
| Heroku                      | Simple      | ~$7-25     | ⭐⭐ Legacy                 |
| AWS EC2 t3.micro            | Complex     | ~$8-15     | ⭐⭐⭐⭐ Enterprise         |
| GCP Cloud Run               | Medium      | ~$0-5      | ⭐⭐⭐⭐ Enterprise         |
| DigitalOcean                | Medium      | ~$6-12     | ⭐⭐⭐ Startup              |

**Why is Azure worth the investment?** Avanade, Accenture, Microsoft Partners, and most large Brazilian companies use Azure. Demonstrating mastery of the platform + Bicep + Container Apps sets candidates apart.

---

## 🧮 Custom Cost Calculator

Access the official calculator: [azure.microsoft.com/en-us/pricing/calculator](https://azure.microsoft.com/en-us/pricing/calculator/?services=container-apps,postgresql)

Services to add:

- Container Apps (Consumption)
- Azure Database for PostgreSQL (Flexible Server, B1ms, East US)

---

## 💡 Money-Saving Tips

1. **Use `az postgres flexible-server stop`** when you're not demonstrating — saves ~$8/month
2. **Keep `minReplicas: 0`** on the Container App — saves ~$2-3/month vs `minReplicas: 1`
3. **Don't use Azure Container Registry** — GHCR is free for public repos and is already configured
4. **Disable geo-redundant backup** on PostgreSQL — already configured as `Disabled`
5. **Disable High Availability** on PostgreSQL — already configured as `Disabled`
6. **Use East US** as the region — generally the lowest prices on Azure

---

## 📅 Annual Estimate

| Scenario                         | Cost/month | Cost/year |
| -------------------------------- | ---------- | --------- |
| Active all year                  | ~$13       | ~$156     |
| Active 6 months, paused 6 months | ~$8.5      | ~$102     |
| Paused (storage only)            | ~$4        | ~$48      |

Within your $50/month budget, there is comfortable room to keep the project active with no worries.

_Translated to English — documentation consolidation, 2026-09._
