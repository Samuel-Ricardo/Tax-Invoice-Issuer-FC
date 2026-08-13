# Observability (Azure Monitor and the wider stack)

Load this file when: designing monitoring/alerting for an Azure workload, investigating an
incident, or choosing between the available observability tools for a specific signal type.

## Azure Monitor is the umbrella, not one tool

"Azure Monitor" refers to the whole platform — metrics, logs, traces, alerting, and dashboards —
composed of several distinct components. Picking the right component for the signal in question
matters more than defaulting to whichever one is most familiar:

| Need                                               | Tool                                                                            | Notes                                                                                                                                                                       |
| -------------------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Logs, cross-resource queries, ad-hoc investigation | **Log Analytics** (KQL)                                                         | The general-purpose query layer; everything with diagnostic settings enabled can land here                                                                                  |
| Distributed tracing / APM for application code     | **Application Insights**                                                        | OpenTelemetry-based; workspace-based App Insights writes telemetry into the same underlying Log Analytics workspace, so traces and logs are queryable together              |
| Kubernetes/container metrics                       | **Azure Monitor managed service for Prometheus**                                | Prometheus-compatible scrape target for AKS; the recommended metrics surface for Kubernetes workloads                                                                       |
| Kubernetes/container logs and cluster health       | **Container Insights**                                                          | Node/pod/container/namespace performance, stdout/stderr capture, integrated AKS dashboards in the portal                                                                    |
| Dashboards over Prometheus + Azure Monitor data    | **Managed Grafana** (or the lighter-weight in-portal "Dashboards with Grafana") | Managed Grafana for full Grafana feature parity and non-Azure data sources; in-portal Grafana dashboards when everything is Azure-native and you want zero extra cost/setup |
| Network-layer observability                        | **Network Watcher** (flow logs, packet capture, Connection Monitor)             | See `networking.md`                                                                                                                                                         |

Don't reach for a third-party stack by default before checking whether Azure Monitor's native
components already cover the need — the native stack has matured substantially and integrates
tightly with RBAC, Private Link, and cost management in ways a bolted-on third party won't.

## AKS observability baseline

For a production AKS cluster, the expected baseline (AKS Automatic enables much of this by
default; verify it explicitly on AKS Standard):

- **Managed Prometheus** scraping node, pod, container, and kube-state-metrics coverage across
  nodes, pods, deployments, daemonsets, statefulsets, jobs, and persistent volumes.
- **Container Insights** with **namespace-scoped collection rules** — this is the primary lever
  for controlling log ingestion cost; collecting every container's verbose logs across every
  namespace by default gets expensive fast without adding proportional value.
- **AKS diagnostic settings** shipping control-plane logs — `kube-audit`, `kube-apiserver`,
  `kube-controller-manager`, `kube-scheduler`, `cluster-autoscaler` — into Log Analytics. These are
  what let you answer "who changed what in the cluster and when" during an incident.
- **Managed Grafana** connected as the team-facing dashboard surface, querying both Managed
  Prometheus (PromQL) and Log Analytics/Azure Monitor data side by side.

If a team wants a fully open-source-native stack instead of Application Insights for tracing (e.g.,
to stay entirely within the Prometheus/Grafana ecosystem), the equivalents are **Grafana Loki**
for logs and **Grafana Tempo** for traces — but note Azure does not offer a managed Loki service as
of 2026, so that choice means self-hosting Loki on AKS with Blob Storage as its backing store,
which is a real operational cost to weigh against Application Insights' fully-managed alternative.

## KQL (Kusto Query Language)

Log Analytics' query language is what makes cross-resource investigation tractable — worth being
fluent in for incident response specifically:

- Structure investigative queries to filter early (time range and resource scope first) before any
  expensive joins or aggregations — Log Analytics performance and cost both depend on this.
- Correlate across tables that share a resource ID or timestamp window (e.g., joining
  `AzureDiagnostics` control-plane events with `ContainerLogV2` application logs) to build the kind
  of "what changed right before this broke" timeline the base agent's incident-response workflow
  calls for.

## Alerting hygiene

- **Metric alerts** — fastest, near-real-time, for simple threshold conditions (e.g., CPU >80%
  sustained for 5+ minutes).
- **Log search alerts** — flexible KQL-based conditions, for anything a simple metric threshold
  can't express.
- **Activity log alerts** — for control-plane events (e.g., a resource deletion, a role
  assignment change) rather than workload health.
- Route alerts through **Action Groups**, tagged/scoped so they reach the team that actually owns
  the resource — an alert that pages the wrong team, or nobody, is worse than no alert, since it
  erodes trust in the alerting system generally (this is the Azure-specific instance of the base
  agent's "toil/alert fatigue" principle: if an alert is routinely ignored, retune or delete it).
- Diagnostic settings must be explicitly enabled per resource to route its metrics/logs anywhere —
  this is a common gap: a resource with no diagnostic setting configured is invisible to alerting
  and KQL investigation alike, regardless of how good the alerting design is elsewhere.

## Cost-aware observability

Observability data volume is itself a cost lever (this connects to `cost-and-finops.md`):

- Use **Application Insights sampling** (adaptive sampling in the SDK) to reduce telemetry volume
  materially for high-traffic services without losing the statistical shape of the data.
- Namespace-scoped Container Insights collection rules (above) for the same reason on AKS.
- Set a **Log Analytics workspace daily cap** and retention policy deliberately, rather than
  leaving ingestion uncapped and unretained by default — verbose debug-level logs kept indefinitely
  at full retention is a common, avoidable cost driver.
