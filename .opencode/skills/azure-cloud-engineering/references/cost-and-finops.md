# Cost Management & FinOps

Load this file when: reviewing or optimizing Azure spend, designing a tagging/cost-allocation
strategy, or evaluating a commitment-discount decision (Reserved Instances/Savings Plans).

## Do the FinOps loop in order — don't skip to "buy reservations"

The FinOps lifecycle is **Visibility → Allocation → Optimization → Forecasting**, and the phases
are sequential for a reason: buying Reserved Instances or restructuring workloads before spend is
correctly _allocated_ to owners just optimizes noise. If asked to "cut the Azure bill," the first
question is whether tagging/allocation is actually in place — if not, that's the real first task,
not right-sizing.

1. **Visibility** — Azure Cost Management gives baseline spend tracking and threshold alerts, but
   on its own it doesn't solve ownership ambiguity; cost views need to be tied back to application/
   team/owner context to be actionable (this is what tagging is for).
2. **Allocation** — enforce tagging with **Azure Policy** (don't rely on tagging-by-convention; it
   drifts). Minimum effective tag set: `cost_center`, `application`, `environment`, `owner_email`,
   `lifecycle_status`. Build cost allocation around the **management group hierarchy** so
   subscription rollups match how the business actually funds and governs workloads (see
   `landing-zones-governance.md`) — a mismatch here is what makes "whose spend is this" chronically
   unanswerable.
3. **Optimization** — only once 1 and 2 are in place does right-sizing, commitment purchasing, and
   waste removal produce durable (not one-time) savings. See the levers below.
4. **Forecasting** — budgets and anomaly detection close the loop, catching drift before it becomes
   a surprise bill.

## Concrete optimization levers, roughly by leverage

- **Azure Advisor** — analyzes actual usage and surfaces prioritized recommendations (cost,
  security, reliability, operational excellence, performance) for free; typically identifies
  15–25% in savings opportunities in an environment that's been running 90+ days: underutilized
  VMs (low sustained CPU), unattached managed disks, idle SQL databases/App Service plans, and
  Reserved Instance opportunities based on 30-day usage history. Run this before any manual audit —
  it's free signal that's usually skipped.
- **Right-sizing** — the highest-leverage recurring action; typically 15–25% savings on its own
  when applied to genuinely overprovisioned compute. On AKS specifically, this means tuning pod
  resource **requests** from real usage data (see `compute-and-aks.md`), which cascades into node
  provisioning and therefore total spend.
- **Reserved Instances** — 1- or 3-year commitment on specific VM SKUs/regions, savings up to
  ~72% for genuinely steady-state workloads. Wrong fit for workloads that change shape/SKU
  frequently — a reservation locked to a SKU you migrate away from stops paying off.
- **Azure Savings Plans** — commit to an hourly _spend_ amount rather than a specific SKU; more
  flexible than Reserved Instances (covers workloads that shift across instance families/regions)
  at a somewhat lower discount ceiling (roughly 25–65% depending on term and workload). Prefer
  Savings Plans over Reserved Instances specifically when workload shape is expected to change
  during the commitment term.
- **Spot VMs / Spot node pools** — up to ~90% savings for genuinely interruption-tolerant workloads
  only (batch, CI runners, dev/test, fault-tolerant AKS pools). Never for stateful or
  latency-sensitive workloads without an explicit, tested eviction-handling plan.
- **Azure Hybrid Benefit (AHB)** — for organizations with existing Windows Server / SQL Server
  licensing under Software Assurance, apply existing licenses to Azure VMs instead of paying full
  pay-as-you-go compute+license pricing. Meaningful savings (roughly 40% for Windows Server compute,
  and up to ~85% for SQL Server Enterprise Edition when combined with Reserved Instances) — but
  only relevant where the organization already holds eligible licensing; check entitlement before
  recommending it as a lever.
- **Automated non-production shutdown** — scheduling dev/test/staging compute to shut down outside
  business hours is a large, low-risk win (roughly 50–70% savings on those environments) that's
  frequently skipped because it requires a small amount of automation, not because it's hard to
  justify.
- **Storage tiering** — moving infrequently accessed Blob data to Cool/Archive tiers rather than
  leaving everything in Hot by default.

## Anomaly detection and budgets

- Configure **Azure Cost Management anomaly detection** at the subscription or resource scope —
  it analyzes historical spend patterns and flags unexpected increases automatically; don't rely
  purely on manual monthly review to catch a runaway resource.
- Set **budgets with alert thresholds** scoped per major workload/team (not just one org-wide
  budget), so the team that caused an overrun is the team that gets notified.
- A practical review cadence: daily automated anomaly alerts (e.g., spend spikes exceeding a
  set % of baseline), weekly operational review (utilization, orphaned resources, tag compliance),
  monthly FinOps steering review (commitment utilization, chargeback accuracy, budget variance).

## Commitment management is a continuous process, not a purchase event

Cloud usage shifts constantly — a Reserved Instance or Savings Plan purchased once and never
revisited tends to under-deliver on paper savings as workload shape drifts. Treat commitment
coverage as something to review and rebalance on a recurring cadence (centralize usage tracking,
watch reservation lifecycle/expiry, alert on coverage gaps or underuse) rather than a "set once"
decision — this is also why teams managing meaningful Azure spend increasingly automate this
rebalancing rather than doing it by hand quarterly.

## AKS-specific cost notes

- AKS's control plane is free (Standard tier) — you pay only for worker node VMs, managed disks,
  load balancers, container registry, and egress. This means node pool right-sizing and node
  pool _type_ choice (on-demand vs. reserved vs. spot, per pool) is where essentially all AKS
  cost-optimization leverage lives.
- Use the **AKS cost analysis view** (namespace-scoped cost breakdown in the Azure Portal) to tie
  spend back to the team/workload owning a given namespace — the Kubernetes-native analogue of
  resource tagging for cost allocation.
