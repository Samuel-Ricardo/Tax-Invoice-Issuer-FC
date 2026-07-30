# Security & Compliance

Load this file when: reviewing an Azure security posture, investigating a potential security
issue, hardening a workload, or mapping controls to a compliance framework.

## The layered model

Azure security is not one product — treat it as layers, and know what each one actually covers so
you don't recommend a tool for a gap it doesn't close:

| Layer               | Azure control                                                       | Covers                                                                                              |
| ------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Identity            | Entra ID + Conditional Access + PIM                                 | Who/what can authenticate and under what conditions (see `identity-and-access.md`)                  |
| Posture (CSPM)      | **Microsoft Defender for Cloud**                                    | Continuous configuration assessment, Secure Score, prioritized recommendations across the estate    |
| Workload protection | Defender plans (Servers, Containers, SQL, Storage, Key Vault, etc.) | Runtime threat detection per resource type                                                          |
| Network             | NSGs, Azure Firewall, Private Link                                  | Segmentation and exposure control (see `networking.md`)                                             |
| Secrets/keys/certs  | **Key Vault**                                                       | Centralized, access-controlled, auditable secret material                                           |
| Governance          | Azure Policy                                                        | Preventing/detecting drift from required configuration at scale (see `landing-zones-governance.md`) |
| SIEM/threat hunting | Microsoft Sentinel                                                  | Cross-signal correlation and investigation, beyond Defender's per-resource findings                 |

A mature environment has all of these working together; a common failure mode is having several
of these products enabled in isolation without them being tied to actual asset ownership or a
remediation workflow — findings pile up in a dashboard nobody is accountable for. When reviewing
a security posture, check for ownership and remediation flow, not just tool presence.

## Microsoft Defender for Cloud

- The baseline **CSPM** (Cloud Security Posture Management) layer for Azure: posture assessment,
  prioritized recommendations, and the **Secure Score** — a 0–100% metric quantifying overall
  posture. Treat Secure Score as a trend to track and prioritize against, not a number to chase for
  its own sake; a recommendation with low real-world impact isn't worth burning cycles on just to
  move the score.
- In production, enabling the specific Defender plans for **Servers, SQL, Storage, Key Vault, and
  Containers** is close to mandatory, not optional — these are the resource types most commonly
  targeted and most consequential when compromised.
- **Just-in-Time (JIT) VM Access** — a Defender for Servers feature that keeps management ports
  (RDP 3389, SSH 22, WinRM 5986) closed by default and opens them only on-demand, time-bound, for
  a specific source IP. Combined with Entra ID + Conditional Access, this can be tightened further
  (e.g., "JIT activation only from a compliant device"). Apply this to every VM with a public IP as
  a standard production control, not an optional hardening step.

## Key Vault hardening checklist

- Use the **RBAC permission model**, not the legacy access-policy model (see
  `identity-and-access.md`).
- Enable **soft delete and purge protection** — without both, a deleted vault or secret can be
  permanently and immediately unrecoverable, whether from an operator mistake or malicious action.
  Treat "delete a Key Vault" as an irreversible action requiring explicit human approval regardless
  of environment, and verify soft-delete/purge-protection status _before_ any deletion is executed.
- **Secrets and keys should have expiration dates**, not be permanent — an unbounded-lifetime
  secret gives an attacker unlimited time to exploit a compromise. Rotate on a defined cadence
  rather than "when we remember."
- One Key Vault per environment (dev/staging/production) at minimum — don't mix secret material
  across environment boundaries in a shared vault.
- Prefer eliminating the secret entirely (via managed identity / workload identity federation)
  over storing-and-rotating it in Key Vault wherever the target actually supports federated auth —
  Key Vault is for secrets that must exist, not a default destination for every credential.

## Compliance framework mapping

When a finding or control needs to be communicated in compliance terms rather than just
engineering terms, map it to the framework the organization actually answers to rather than
presenting an unranked list of technical findings:

- **CIS Benchmarks** (Azure, Kubernetes) — widely used as the concrete, checkable baseline; the
  CIS Kubernetes Benchmark alone has 200+ recommendations, with RBAC, Pod Security Standards,
  network policies, etcd encryption, and audit logging as the highest-impact subset.
- **NIST SSDF** — frames secure development as controls integrated into each phase of the SDLC,
  useful when the conversation is about pipeline/process design rather than a point-in-time
  configuration check.
- **SOC 2 / ISO 27001 / GDPR** — access governance controls (PIM, access reviews, entitlement
  management — see `identity-and-access.md`) map directly to the "least privilege, auditable
  access decisions" requirements these frameworks care about.
- **Microsoft Cloud Security Benchmark** — Microsoft's own prescriptive benchmark, useful as the
  default reference when there isn't a specific external framework in play, and what several
  built-in Azure Policy initiatives are built around.

## Priority order for a from-scratch security review

Don't start by buying more tooling. Start with structure, in this order, since each layer depends
on the one before it being sound:

1. Management group hierarchy and baseline Azure Policy (governance foundation).
2. Identity — MFA via Conditional Access, PIM for all privileged access (fastest-ROI layer; most
   breaches trace back to identity, not a missing scanner).
3. Network — NSG micro-segmentation, Private Link for anything sensitive.
4. Data — Key Vault + customer-managed keys where required, data classification.
5. Monitoring — Defender for Cloud + centralized diagnostic logging + Sentinel if the org needs
   SIEM-grade correlation.
6. Continuous improvement — recurring policy and Secure Score review, not a one-time audit.

## Supply chain / DevSecOps (cross-reference)

SBOM generation, artifact signing, and pipeline-stage scanning are covered from the general
DevSecOps angle in the base agent's `<domain_expertise>`; the Azure-specific piece is wiring those
checks into Azure DevOps/GitHub Actions pipelines that deploy to Azure (see `cicd-pipelines.md`)
and storing signing keys/attestation material in Key Vault rather than in pipeline secrets.
