---
name: azure-cloud-engineering
description: Comprehensive Microsoft Azure cloud engineering knowledge for the DevOps Engineer Specialist agent — landing zones and governance (CAF), identity and Zero Trust (Entra ID, RBAC, PIM), networking (hub-spoke, Private Link, Azure Firewall), compute and AKS, infrastructure as code (Bicep, Terraform/OpenTofu, Azure Verified Modules), CI/CD (GitHub Actions and Azure DevOps with OIDC), security (Defender for Cloud, Key Vault), observability (Azure Monitor, Log Analytics, Managed Prometheus/Grafana), and cost/FinOps. Use whenever a task involves Azure — designing, reviewing, deploying, securing, troubleshooting, or optimizing anything running on Azure, or when the user mentions Azure, AKS, Entra ID, Bicep, Azure DevOps, ARM, Azure Policy, or a specific Azure service by name.
license: Proprietary — internal use with the DevOps Engineer Specialist agent
metadata:
  author: devops-engineer-specialist
  version: "1.0"
  domain: cloud-infrastructure
  provider: azure
---

# Azure Cloud Engineering

This skill extends the **DevOps Engineer Specialist** agent (see the agent's core system prompt
for identity, guardrails, and workflows — this skill supplies the Azure-specific domain knowledge
that plugs into that agent's `<domain_expertise>` and `<workflows>` sections). Everything here is
current as of 2026 and grounded in the Azure Well-Architected Framework, the Cloud Adoption
Framework (CAF), and Microsoft Learn / Azure Architecture Center guidance.

**Do not try to hold all of Azure in context at once.** This file is the router: it tells you the
decision frameworks, the current defaults, and — critically — _which reference file to open_ for
the depth a given task actually needs. Load a reference file only when the task touches that area.

```
azure-cloud-engineering/
├── SKILL.md                          # you are here — router + top-level decision frameworks
└── references/
    ├── landing-zones-governance.md   # CAF, management groups, subscription vending, Azure Policy, tagging
    ├── identity-and-access.md        # Entra ID, RBAC, PIM, Conditional Access, managed identity, workload identity federation
    ├── networking.md                 # hub-spoke, Private Link, Azure Firewall, NSGs, DNS, egress
    ├── compute-and-aks.md            # VMs, App Service, Container Apps, Functions, AKS deep dive
    ├── iac-bicep-terraform.md        # Bicep vs Terraform/OpenTofu, Azure Verified Modules, state, testing
    ├── cicd-pipelines.md             # GitHub Actions & Azure DevOps, OIDC/workload identity federation, approvals
    ├── security-and-compliance.md    # Defender for Cloud, Key Vault, Secure Score, JIT, benchmarks
    ├── observability.md              # Azure Monitor, Log Analytics/KQL, App Insights, Managed Prometheus/Grafana
    └── cost-and-finops.md            # Cost Management, Reserved Instances, Savings Plans, Hybrid Benefit, tagging
```

## When this skill applies

Any task touching Azure: designing a new landing zone or workload, writing or reviewing Bicep/
Terraform for Azure resources, standing up or hardening an AKS cluster, wiring CI/CD to deploy to
Azure, investigating an Azure incident, reviewing an Azure security posture, or optimizing an Azure
bill. If the task is generic DevOps/SRE work with no Azure-specific surface, this skill isn't needed
— use the base agent knowledge instead.

## The lens: Azure Well-Architected Framework

Every Azure recommendation you make should be traceable to one of the five WAF pillars. When
pillars conflict (they often do), state the tradeoff explicitly rather than silently picking one:

| Pillar                     | Core question                                                           | Primary Azure levers                                                                                |
| -------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Reliability**            | Does it recover from failure at the SLO the workload actually needs?    | Availability zones, region pairs, AKS uptime SLA, PodDisruptionBudgets, backup/DR                   |
| **Security**               | Is access, data, and network exposure minimized by default?             | Entra ID + Zero Trust, RBAC, Defender for Cloud, Key Vault, Private Link                            |
| **Cost Optimization**      | Is spend proportional to delivered value?                               | Reserved Instances/Savings Plans, right-sizing, Azure Hybrid Benefit, tagging-driven accountability |
| **Operational Excellence** | Can the team safely change this system, and detect when it's unhealthy? | IaC + GitOps, Azure Monitor/observability, landing zone guardrails, runbooks                        |
| **Performance Efficiency** | Does it scale to (and no further than) actual demand?                   | Autoscaling (HPA/VPA/KEDA/cluster autoscaler), caching, SKU right-sizing                            |

Run the free **Azure Well-Architected Review** framing mentally even when you don't run the actual
tool: for any nontrivial design, name which pillar you're optimizing for and what you're trading
away.

## Top-level decision framework

Use this before diving into a reference file — it tells you _which_ file actually matters for the
task in front of you.

1. **Is this a new environment / subscription / tenant-level decision?**
   → `references/landing-zones-governance.md` (management group hierarchy, subscription vending,
   Azure Policy). Almost nothing else is safe to design correctly until this foundation exists.
2. **Is this about who/what can access something?**
   → `references/identity-and-access.md`. Default to Zero Trust: verify explicitly, least
   privilege, assume breach. No standing privileged access — PIM everywhere.
3. **Is this about connectivity between resources, or exposure to the internet?**
   → `references/networking.md`. Default topology is hub-spoke with Private Link for PaaS and an
   explicit, logged egress path (implicit outbound public IPs are gone as of March 2026).
4. **Is this about running application/container workloads?**
   → `references/compute-and-aks.md`. For containers, AKS is the default; know when _not_ to
   reach for Kubernetes too (Container Apps / App Service for simpler workloads).
5. **Is this about defining infrastructure in code?**
   → `references/iac-bicep-terraform.md`. Default: Bicep + Azure Verified Modules for Azure-only
   estates; Terraform/OpenTofu when multi-cloud or the org already has that investment. Plan
   before apply, always, per the base agent's `<safety_and_guardrails>`.
6. **Is this about getting code/config into Azure automatically?**
   → `references/cicd-pipelines.md`. Default: OIDC / Workload Identity Federation — no long-lived
   client secrets in any pipeline, ever.
7. **Is this about hardening, scanning, or investigating a security posture?**
   → `references/security-and-compliance.md`. Defender for Cloud + Secure Score is the baseline
   CSPM lens; Key Vault is the secrets/keys/certs boundary.
8. **Is this about knowing whether something is healthy, or debugging why it isn't?**
   → `references/observability.md`. Azure Monitor is the umbrella; know when to reach for KQL vs.
   Managed Prometheus/Grafana vs. Application Insights.
9. **Is this about spend?**
   → `references/cost-and-finops.md`. Visibility → allocation → optimization → forecasting, in
   that order — don't jump straight to buying Reserved Instances before tagging is in place.

## Azure-specific supplements to the base agent's guardrails

The base agent's `<safety_and_guardrails>` (reversibility, blast radius, approval tiers) applies
as-is. On Azure specifically, calibrate blast radius using the resource hierarchy, since it _is_
the blast-radius boundary:

- **Management group / Azure Policy changes** — the widest possible blast radius; a bad policy
  assignment at a high management group can lock out or break every subscription beneath it.
  Always require human approval; always test with `Audit`/`what-if` before `Deny`/enforce.
- **Subscription-level changes** (e.g., changing a subscription's management group, altering
  default policies) — wide blast radius; treat like a production infrastructure change even in
  a "dev" subscription, because subscriptions are often shared platform boundaries.
- **Resource group / resource-level changes** — scope blast radius to the resource group; still
  requires approval if the resource group is shared or production-tagged.
- **A `terraform apply` / Bicep deployment against a `prod`-tagged scope, an AKS `kubectl apply`
  against a production namespace, or any Key Vault/RBAC change** — always in the "propose, then
  require approval" tier, never auto-executed.
- **Azure resource deletion, especially with `--force` or without soft-delete/purge-protection
  enabled** — treat as hard-to-reverse regardless of environment; confirm soft delete/purge
  protection status before deleting Key Vaults, Storage Accounts, or SQL databases.

## Quick-reference: default Azure choices (2026)

When a design decision doesn't have a strong reason to deviate, these are the current sane
defaults — state them, then adjust if the workload's actual constraints differ:

- **IaC**: Bicep + Azure Verified Modules (Azure-only) or Terraform/OpenTofu + AVM Terraform
  modules (multi-cloud or existing Terraform investment). Never hand-edit resources in the portal
  for anything that IaC should own (no ClickOps).
- **Identity for pipelines**: OIDC / Workload Identity Federation via a user-assigned managed
  identity. No client secrets, no certificates to rotate.
- **Identity for humans**: Entra ID + Conditional Access (MFA everywhere) + PIM for anything
  privileged (no standing admin roles).
- **Network egress**: explicit (NAT Gateway or Azure Firewall) — implicit default outbound is
  retired for new VNets as of March 31, 2026.
- **Containers**: AKS with workload identity (OIDC-federated, no stored credentials in pods),
  Azure CNI, Pod Security Admission at `restricted`, system/user node pool separation.
- **Secrets**: Key Vault, RBAC permission model (not the legacy access-policy model), secrets/keys
  with expiration dates, soft delete + purge protection enabled.
- **Observability**: Azure Monitor as the umbrella; Managed Prometheus + Managed Grafana for AKS
  metrics/dashboards; Log Analytics (KQL) for logs and cross-resource queries; Application Insights
  (OpenTelemetry-based) for distributed tracing/APM.
- **Cost governance**: Azure Policy-enforced tagging (`cost_center`, `application`, `environment`,
  `owner_email`) from day one — retrofitting tagging is far more expensive than starting with it.
