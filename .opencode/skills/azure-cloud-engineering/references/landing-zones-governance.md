# Landing Zones & Governance (Cloud Adoption Framework)

Load this file when: designing a new Azure environment, deciding subscription/management-group
structure, setting up Azure Policy, planning tagging strategy, or onboarding a new workload into
an existing estate.

## What a landing zone actually is

An Azure landing zone is the pre-configured, governed environment a workload gets deployed _into_
— the CAF equivalent of building codes for a commercial building: the plumbing (networking,
identity, policy, RBAC) exists before anyone moves in. It has two components:

- **Platform landing zone** (typically one per Microsoft Entra tenant): the shared backbone —
  management group hierarchy with Azure Policy enforcement, and dedicated subscriptions for
  connectivity, identity, management, and security shared services.
- **Application (workload) landing zones** (multiple per workload): one or more subscriptions per
  workload, nested under the right management group (e.g., "Online" or "Corp") to inherit policy.
  A workload should have a separate landing zone per environment (dev/test/prod).

Without a landing zone, every team builds its own subscriptions, networking, and security
controls independently — the predictable result is inconsistent configuration, network conflicts,
and governance chaos. Do not let a workload team deploy production resources into an ungoverned
subscription; that decision compounds in cost the longer it goes unaddressed.

## Management group hierarchy

- Management groups exist to **assign Azure Policy and RBAC at scale**, not primarily for billing
  (that's what subscriptions and cost-allocation tags are for). Don't conflate the two purposes.
- **Keep the hierarchy flat**: 3–4 levels is the practical target; the platform limit is 6 levels
  deep (not counting tenant root or subscription level), but depth adds management overhead
  without adding governance value beyond a certain point.
- **Don't mirror your org chart.** Org structures change often; management group hierarchies are
  expensive to restructure. Structure by governance need (regulatory boundary, environment type,
  workload archetype), not by team/department.
- All new subscriptions land under the tenant root management group by default — move them
  immediately into the correct branch as part of subscription creation, not as a follow-up task.
- Enable Azure RBAC authorization for management group operations rather than leaving the default
  (any principal in the tenant can create new management groups by default — lock this down).

A typical structure: `Tenant Root → Platform (Connectivity / Identity / Management)` and
`Tenant Root → Landing Zones (Corp / Online) → [environment subscriptions]`, plus a `Sandbox` and
a `Decommissioned` branch so policy can differ for experimentation and offboarding.

## Subscriptions as the real isolation boundary

Subscriptions, not resource groups, are the hard boundary for blast radius, cost allocation, and
policy inheritance in most Azure governance models. Practical guidance:

- One or more subscriptions per workload per environment (dev/test/prod separated at the
  **subscription** level for anything production-sensitive, not just the resource-group level).
- Subscriptions also serve as scaling units — some Azure resource limits are per-subscription, so
  a workload that will grow needs headroom, not just isolation.
- "Subscription vending" — a self-service, policy-compliant process for application teams to
  request a new landing zone subscription without a manual platform-team ticket — is the maturity
  marker that separates a scaling landing zone practice from a bottlenecked one.

## Azure Policy

- Apply policy at the **management group** level for anything that must be universally true
  (e.g., "deny public IP on NIC," "require encryption on storage," "require NSG on every subnet,"
  "allowed locations"). Applying policy per-subscription doesn't scale and drifts.
- Roll out new policies in **Audit** mode first, review the compliance report, then switch to
  **Deny**/enforce — the same "plan before apply" discipline as IaC, applied to governance itself.
  A `Deny` policy pushed straight to a high management group without an audit period is exactly
  the kind of high-blast-radius action that needs explicit human approval per the base agent's
  guardrails.
- Use **Azure Policy initiatives** (grouped policy sets) to apply a coherent bundle (e.g., a CIS
  benchmark or a regulatory framework) rather than assigning dozens of individual policies
  piecemeal.
- Common high-value policy set for a new landing zone: require resource tags, deny public IPs on
  NICs by default, require NSGs on subnets, require encryption at rest, restrict allowed regions/
  locations, require Defender for Cloud enablement, deny specific over-provisioned VM SKUs.

## Tagging strategy

Tagging is a governance and FinOps prerequisite, not an afterthought — enforce it with Azure
Policy from the first subscription, because retrofitting tags across an established estate is
far more expensive than starting with them. A minimal effective tag set:

`cost_center`, `application`, `environment` (dev/test/staging/prod), `owner_email`,
`lifecycle_status` (active/decommissioning). Cost views, reservation planning, and incident
ownership all depend on this being consistently populated — treat missing tags as a policy
violation to remediate, not a cosmetic gap.

## Bringing an existing (ungoverned) environment into a landing zone

For an organization with a single subscription and no management groups already running
workloads: deploy the new management group structure alongside the existing environment (so it
doesn't disrupt running workloads), then migrate workloads into the new hierarchy incrementally,
workload by workload, moving each into the correctly-scoped subscription under the right
management group. This is itself a change that should go through the base agent's
`infrastructure_change` workflow — plan, review, apply, verify drift — not a manual one-off.
