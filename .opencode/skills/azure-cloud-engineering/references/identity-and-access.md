# Identity & Access (Entra ID, RBAC, Zero Trust)

Load this file when: designing access control, reviewing who/what can do what, setting up
pipeline authentication, or investigating an identity-related security question.

## The governing model: Zero Trust

Microsoft's Zero Trust model rests on three principles — apply them as the default lens for every
identity decision, not just as a slogan:

1. **Verify explicitly** — authenticate and authorize using every available signal (identity,
   device compliance, location, application, data sensitivity, real-time risk), not just a
   password.
2. **Use least privilege** — just-in-time and just-enough access, risk-based adaptive policies,
   no standing administrative access.
3. **Assume breach** — minimize blast radius via segmentation, verify end-to-end encryption, use
   analytics to detect and respond to threats.

Identity is the control plane in Azure. The old perimeter-firewall mental model doesn't apply —
architect access decisions around identity and device signal, not network location.

## Microsoft Entra ID core building blocks

- **Entra ID** (formerly Azure AD) is the tenant-wide identity plane: users, groups, roles,
  enterprise applications.
- **Conditional Access** is the Zero Trust policy engine — if/then statements evaluated on every
  sign-in ("if a user wants to access X, they must satisfy Y": MFA, compliant device, trusted
  location, blocked legacy auth protocol, etc.). Roll out Conditional Access **incrementally**
  and in **report-only mode first** — rushing deployment without watching sign-in logs and impact
  reports is one of the fastest ways to lock out legitimate users or cause an outage. Always
  exclude a break-glass emergency-access account from Conditional Access policies, and audit that
  account's use.
- **Privileged Identity Management (PIM)** — the mechanism for least-privilege administration.
  Admins hold roles as **eligible**, not standing/active; every activation requires MFA, a
  justification, and is time-bound, then automatically expires. Requires Entra ID P2 (or Entra ID
  Governance). Use PIM for both Entra roles (e.g., Global Administrator, Cloud Application
  Administrator) and Azure resource roles (e.g., Owner/Contributor on a subscription or resource
  group) — don't assume PIM only covers one or the other.
- **Identity governance** (Access Reviews, Entitlement Management): access naturally accumulates
  and is rarely removed without a forcing function. Regular access reviews validate group/app
  membership; entitlement management provides time-boxed access packages. This is what makes
  least-privilege durable rather than a one-time cleanup, and is typically what compliance
  frameworks like SOC 2 and ISO 27001 actually check for.
- **Group-based access, not per-user assignment.** Attach privilege to groups; users inherit
  access through membership. This makes both grants and audits tractable at scale.

## RBAC design

- **Azure RBAC** (resource-scoped: management group / subscription / resource group / resource)
  is layered on top of Entra ID identities. Assign roles at the **highest scope that's still
  correct** and no higher — a Contributor grant at a management group is a very different blast
  radius than the same grant on one resource group.
- Prefer **built-in roles** scoped narrowly over custom roles with broad permissions; prefer
  custom roles with a tightly scoped action list over reusing "Owner" as a default because it's
  convenient.
- **Key Vault**: use the RBAC permission model, not the legacy vault access-policy model — RBAC
  gives auditable, consistent role assignment via the same Entra ID mechanism as everything else.

## Workload identity (service-to-service and pipeline auth)

This is the area with the most consequential 2026 shift: **long-lived secrets are no longer the
right default anywhere they can be avoided.**

- **Managed identities** (system-assigned or user-assigned) are the default for Azure resource-to-
  resource authentication (e.g., an App Service or VM calling Key Vault or Storage). Prefer
  **user-assigned** managed identities for anything that should survive the lifecycle of a single
  resource (e.g., a pipeline's identity shouldn't disappear if the resource that first used it is
  deleted) and for anything where you want one place to manage role assignments across multiple
  resources.
- **Workload Identity Federation (OIDC)** extends this to non-Azure workload identities — most
  importantly, **CI/CD pipelines** (GitHub Actions, Azure DevOps, GitLab, HCP Terraform) and, for
  AKS, individual **pods** (AKS Workload Identity). The pipeline/pod presents a short-lived,
  platform-issued OIDC token; Entra ID validates it against a federated credential trust
  configuration and issues a short-lived Azure access token. No client secret is stored or
  rotated anywhere. See `cicd-pipelines.md` for the pipeline-specific configuration.
- **AKS Workload Identity** gives **pod-level** identity granularity: each pod's Kubernetes
  service account is bound via OIDC to a specific, narrowly-scoped Entra ID identity. If a pod is
  compromised, the blast radius is the narrow permission set of that one workload identity — not
  the node's identity, and not a shared secret usable across the cluster. This is the direct
  Kubernetes-world instance of the "least privilege" principle and should be the default over
  node-level managed identity or (worse) stored service principal credentials in a Secret.
- **Never** put a client secret or certificate for a service principal into pipeline variables,
  environment files, or source control as a matter of convenience. If you inherit a pipeline doing
  this, flag it as a security finding and propose the OIDC migration.

## Practical checklist for a new environment's identity design

1. Break-glass emergency-access accounts created, excluded from Conditional Access, monitored.
2. MFA enforced tenant-wide via Conditional Access; legacy authentication blocked.
3. All standing privileged role assignments converted to PIM-eligible; zero permanent Owner/Global
   Admin assignments as the target state.
4. RBAC assignments reviewed against least privilege at the correct scope (not defaulting to
   subscription-level Owner because it's easier).
5. Every pipeline authenticates via workload identity federation; audit for any remaining
   client-secret-based service principals and schedule their migration.
6. Access reviews scheduled on a recurring cadence for privileged groups and high-sensitivity
   application access.
