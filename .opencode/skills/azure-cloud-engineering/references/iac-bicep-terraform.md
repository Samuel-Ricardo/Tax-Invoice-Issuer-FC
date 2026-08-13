# Infrastructure as Code on Azure: Bicep, Terraform/OpenTofu, ARM

Load this file when: writing or reviewing Azure IaC, choosing between Bicep and Terraform for a
new estate, or designing module/state strategy.

## Choosing a tool

There is no universally correct answer — state the tradeoff explicitly for the specific team:

| Situation                                                                                     | Recommendation                                               | Why                                                                                                                                                                                                 |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Azure-only, small-to-mid team, no multi-cloud plans                                           | **Bicep**                                                    | Simpler operational model (no state file to manage, no provider version coordination), tighter Azure ergonomics, native `what-if` for plan-before-apply, first-class Microsoft support and tooling. |
| Multi-cloud, or heavy non-Azure/third-party provider needs (DNS, SaaS config, monitoring)     | **Terraform** (or **OpenTofu** for the open-governance fork) | Unified workflow across providers; the Terraform Registry's module ecosystem is unmatched in surface area (quality varies — vet before adopting).                                                   |
| Team already has deep Terraform investment/expertise                                          | **Stay on Terraform/OpenTofu**                               | Migration cost is rarely worth it purely for Azure-native ergonomics gains.                                                                                                                         |
| Heavy existing investment in Azure DevOps / Azure Blueprints / Azure Policy-centric workflows | **Bicep**                                                    | Integrates more naturally with those Azure-native governance tools.                                                                                                                                 |

ARM JSON templates are what Bicep compiles to; there's essentially no reason to hand-write ARM
JSON directly in a new estate — use Bicep (or Terraform) and let tooling handle the JSON layer.

## Azure Verified Modules (AVM) — use these by default

**Azure Verified Modules** is Microsoft's official, curated module library for both Bicep and
Terraform, aligned to the Well-Architected Framework. This is the single highest-leverage
recommendation for new Azure IaC in 2026: **don't write a resource module from scratch if an AVM
module already covers it.**

- Bicep AVM modules live in the Public Bicep Registry under the `avm/` namespace
  (`br/public:avm/...`); Terraform AVM modules live on the Terraform Registry under `Azure/avm-*`.
- What you get for free: defaults aligned with the Well-Architected Framework (RBAC over legacy
  access policies, TLS 1.2+, private endpoint support built in), semantic versioning so upgrades
  are reviewable diffs, deployment tests run by the AVM team, and an actual Microsoft support path
  instead of an unmaintained community module.
- The **Azure Landing Zones (ALZ)** accelerator, for both Bicep and Terraform, is now built on AVM
  — adopting AVM for platform-landing-zone IaC is the supported path, not a workaround.
- Adoption pattern for an existing estate: browse the AVM catalogue, pick a non-critical workload
  first, wrap one AVM resource module in your own thin internal module, deploy it through the
  existing pipeline, and expand from there — don't attempt a big-bang migration of every module at
  once.
- Align your internal module interfaces with Azure Policy (tagging, naming) so governance is
  enforced at the IaC layer itself, not only caught at runtime by policy evaluation after the fact.

## Plan before apply — non-negotiable

This mirrors the base agent's core guardrail directly: `terraform plan` / `pulumi preview` /
Bicep's `what-if` operation is how you preview exactly what a deployment will change **before** it
touches real infrastructure. Never propose or execute an `apply`/deployment to a shared, staging,
or production scope without first producing and reviewing the plan/what-if output and stating its
blast radius.

```bash
# Bicep — preview changes before executing
az deployment sub what-if \
  --location eastus \
  --template-file main.bicep \
  --parameters environmentName='production'
```

## State management (Terraform/OpenTofu specific)

Terraform's explicit state file is powerful (drift detection, targeted operations, resource
import/move for refactoring) and also the single biggest operational risk surface if mismanaged:

- **Remote state, always**, with locking and encryption — an Azure Storage Account backend with a
  lease-based lock is the standard pattern. Never use local state for anything beyond a throwaway
  experiment.
- **Never commit state to source control** — state routinely contains secrets/outputs in
  plaintext; treat exposure of a state file as a credential-leak-severity incident.
- A well-tested pattern from Microsoft's own internal Azure Landing Zone practice: a **three-layer
  state model** — separate state per layer of the platform (e.g., platform/connectivity, platform/
  identity, workload) so a change at one layer can't accidentally touch resources it shouldn't
  reach, and blast radius per `apply` stays bounded.
- Separate the **identity used to plan** from the **identity used to apply**. Plan needs read
  access (Reader plus a few read-data permissions); apply needs write access. A single
  Owner-scoped identity used for both is a standing high-privilege credential doing double duty —
  avoid it even when OIDC/workload identity federation removes the "stored secret" risk, because
  the privilege-scope risk remains.

## Testing pyramid for Azure IaC

Layer the checks so failures are caught as early (and cheaply) as possible:

1. **Static analysis** (no cloud API calls): Checkov or tfsec against Terraform/Bicep, catching
   security misconfigurations (public storage, missing encryption, overly broad IAM) before any
   plan is even run.
2. **Policy-as-code**: Open Policy Agent + Conftest (Rego rules evaluated against plan JSON) or
   Azure Policy itself in Audit mode, failing the pipeline on a violated rule.
3. **Integration tests**: provision real infrastructure in a dedicated test subscription/account,
   assert against it (can this service reach that database? does the load balancer return 200?),
   then tear down. Terratest (Go) is the most widely used framework for this on Terraform; expect
   this stage to add real pipeline time (15–45 minutes) but it catches regressions in CI that would
   otherwise surface in production days later.
4. **Manual plan/what-if review** for anything touching a shared or production scope — a human
   reviews the actual diff before approving, regardless of how many automated checks passed.

## Common brownfield failure modes to watch for (and flag when found)

- Modules written from scratch per-team, never tested the same way twice, instead of shared AVM
  modules.
- Per-environment folders that silently diverge over time instead of parameterized, tested
  modules.
- Long-lived secrets/certificates sitting in pipeline variables instead of workload identity
  federation (see `cicd-pipelines.md`).
- One identity performing both plan and apply, scoped as Owner on a management group.
- No approvals, or approvals attached in the wrong place (e.g., an approval on a GitHub
  Environment that a clever workflow author can route around — put the approval on the service
  connection/identity boundary, not only the environment record).
