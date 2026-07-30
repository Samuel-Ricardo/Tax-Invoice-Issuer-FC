# Compute & AKS

Load this file when: choosing a compute platform, designing or reviewing an AKS cluster, or
tuning workload scaling/resource allocation on Azure.

## Choosing a compute platform (before defaulting to AKS)

Kubernetes is powerful and frequently over-selected. Match the platform to the workload's actual
shape:

- **Azure Functions** — event-driven, short-lived, spiky workloads where you don't want to manage
  a runtime at all.
- **Azure Container Apps** — containerized microservices/APIs that want Kubernetes-style scaling
  (including scale-to-zero, KEDA-based event-driven scaling) **without** owning cluster
  operations. A strong default for teams that don't need raw Kubernetes API access, custom
  operators, or fine-grained node control.
- **App Service** — web apps/APIs on a managed PaaS runtime; simplest operational model for
  standard web workloads, including deep Windows/.NET integration.
- **AKS** — when you need Kubernetes primitives directly (custom controllers/operators, complex
  multi-tenant workload isolation, a specific CNCF ecosystem tool, or genuine portability across
  clusters/clouds), or when the team already operates Kubernetes elsewhere and wants a consistent
  operating model.
- **VMs / VM Scale Sets** — for workloads that need OS-level control, licensing arrangements
  (Azure Hybrid Benefit), or legacy applications that can't be containerized economically.

Recommend AKS because the workload's requirements call for it — not by default because
"Kubernetes is what DevOps teams use."

## AKS cluster modes: Automatic vs. Standard

As of 2026, AKS has two operating modes:

- **AKS Automatic** — the recommended **starting point for most production workloads**. Microsoft
  manages system node pools, enables Horizontal Pod Autoscaler / KEDA / Vertical Pod Autoscaler
  automatically, automates cluster and node OS upgrades on a safe cadence, and preconfigures
  security controls (workload identity, OIDC issuer, API server VNet integration, deployment
  safeguards) and observability (Managed Prometheus, Container Insights) by default. It includes a
  pod-readiness SLA (99.9% within 5 minutes) and cluster uptime SLA (99.95%). Choose this unless
  you have a specific, articulable reason to need more control.
- **AKS Standard** — full control over node pool configuration, upgrade cadence, and cluster
  settings. Choose this for large-scale clusters (thousands of nodes), highly customized
  networking/security requirements, or workloads with very specific compliance/architecture needs
  that Automatic's opinionated defaults don't accommodate.

## Node pool design

- **Separate system and user node pools.** System pool runs CoreDNS, metrics-server, and other
  `kube-system` workloads; a minimum of **3 nodes** for the system pool and **2 nodes** for user
  pools is the practical floor for availability. Isolating system pods from application workloads
  means a runaway application workload can't starve the components the cluster itself needs to
  function.
- Use **multiple user node pools** segmented by workload class: general-purpose (e.g., D-series)
  for typical application workloads, memory-optimized (E-series) for caches/in-memory databases,
  and **Spot node pools** for fault-tolerant, interruptible workloads (batch, CI runners) — spot
  can save 60–90% versus pay-as-you-go compute for workloads that tolerate eviction.
- Host **application pods only on user node pools**, never on the system pool.
- AKS has a **1,000-node limit per node pool**; plan multiple user node pools if scaling toward
  the low thousands of nodes, and expect to batch scale-up operations (roughly 500–700 nodes at a
  time with a 2–5 minute wait between batches) to avoid Azure API throttling at extreme scale.

## Identity and secrets on AKS

- **AKS Workload Identity (OIDC federation)** is the default for pod-to-Azure-resource
  authentication — bind a Kubernetes service account to a narrowly-scoped Entra ID identity per
  workload, not per node. This gives per-pod blast-radius containment: a compromised pod only has
  the permissions of its own workload identity, not the node's identity and not a shared secret.
  See `identity-and-access.md` for the underlying federation mechanism.
- **Azure Key Vault CSI driver** — mount secrets, keys, and certificates from Key Vault directly
  into pods rather than storing them as native Kubernetes Secrets (which are only base64-encoded,
  not encrypted, by default).
- Never fall back to long-lived service principal credentials stored as a Kubernetes Secret for
  workload-to-Azure auth — that's the exact anti-pattern workload identity federation exists to
  eliminate.

## Security hardening baseline

- **Private clusters** — no public API server endpoint, for anything beyond a dev/experimentation
  cluster.
- **Entra ID integration with Kubernetes RBAC** — identity-based access to the cluster itself,
  not static kubeconfig credentials shared around a team.
- **Microsoft Defender for Containers** — runtime threat detection layered on top of the cluster.
- **Azure Policy for Kubernetes** — enforce Pod Security Standards (target `restricted` for
  application workloads: non-root, no privilege escalation, dropped Linux capabilities, read-only
  root filesystem where feasible, mandated seccomp profile) and other guardrails (approved
  registries only, required resource limits) via policy rather than manual review.
- **Network policies** (Calico or Azure-native) for pod-level micro-segmentation — default-deny
  between namespaces/workloads with explicit allows, mirroring the NSG default-deny pattern at the
  network layer.
- **Encryption**: encrypted etcd, disk encryption with customer-managed keys where compliance
  requires it (e.g., HIPAA-adjacent workloads processing regulated data).

## Scaling

- **Cluster Autoscaler** (node-level), **Horizontal Pod Autoscaler** (replica count from CPU/
  memory/custom metrics), **KEDA** (event-driven scaling, including scale-to-zero for suitable
  workloads), and **Vertical Pod Autoscaler** (right-sizing requests/limits) are complementary, not
  redundant — tuning them independently, without considering how they interact, is a common cause
  of cascading misconfiguration (e.g., VPA and HPA fighting over the same metric).
- Rightsizing pod CPU/memory **requests** is the single highest-leverage lever: requests drive
  scheduling decisions, node provisioning, and — directly — infrastructure cost. Set them from
  observed usage data, not guesses; revisit them as workload behavior changes, not once at launch.
- Reserve **Spot node pools** for workloads with clear failure tolerance only (stateless batch,
  CI/CD runners, dev/test) — never for anything stateful or latency-sensitive without an explicit,
  tested failover plan.

## Reliability baseline (Well-Architected)

- PodDisruptionBudgets on everything that matters, so voluntary disruptions (node upgrades, scale-
  down) don't take out all replicas of a service simultaneously.
- Liveness, readiness, **and** startup probes on every workload — readiness gates traffic,
  liveness recovers hung processes, startup probes prevent slow-starting apps from being killed
  prematurely by liveness checks.
- Factor the AKS uptime SLA into availability targets and recovery objectives rather than assuming
  100% control-plane availability.
- Separate workloads/flows into different node pools where they need to scale independently, so
  one flow's scaling behavior doesn't starve another's capacity.
