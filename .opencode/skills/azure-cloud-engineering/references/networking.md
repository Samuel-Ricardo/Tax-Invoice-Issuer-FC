# Networking

Load this file when: designing VNet topology, connecting workloads to PaaS services privately,
configuring egress, or reviewing/troubleshooting network security.

## Default topology: hub-and-spoke

Hub-and-spoke is the Microsoft-endorsed default topology in CAF for any environment beyond a
single, simple workload. Use it when you need shared services (firewall, DNS, Bastion, VPN
Gateway/ExpressRoute) across multiple workloads, centralized traffic inspection, or a repeatable
pattern for separating platform (hub) from workload (spoke) networking. If there's genuinely a
single workload with no shared-service requirement, a flat VNet is a reasonable simpler starting
point — don't build hub-spoke ceremony for something that doesn't need it yet.

- **Hub VNet**: shared services only — Azure Firewall, VPN Gateway/ExpressRoute, Azure Bastion,
  central DNS resolution. Keep the hub clean; it should not host application workloads.
- **Spoke VNets**: one per workload/environment, peered to the hub. Spokes communicate with each
  other **through the hub**, never directly — this is what makes central inspection and logging
  possible.
- **Routing**: apply a user-defined route (UDR) to each spoke subnet with the default route
  (`0.0.0.0/0`) pointing at the hub firewall's private IP, forcing all outbound (including
  spoke-to-spoke) traffic through the firewall for inspection and logging.
- **Scale limits**: a hub VNet supports up to 500 peering connections by default (1,000 if using
  Azure Virtual Network Manager with a hub-spoke connectivity configuration). At real scale,
  consider **Virtual WAN**, where Microsoft manages the hub and simplifies routing via routing
  intent/policies — trading some control for less operational overhead versus a self-managed hub.
- **IP address planning**: be generous — there's no cost to reserving large private (RFC 1918)
  blocks, and re-IPing live workloads later is expensive and risky. A common starting allocation
  is a `/16` for the hub and at least a `/20` per spoke, with headroom for growth; subdivide the
  hub by function (firewall subnet, gateway subnet, Bastion subnet, etc.).

## Azure Bastion placement

Deploy Bastion **once, in the hub**, not per-spoke — Basic SKU and above support VNet peering, so
a single hub Bastion instance can manage VMs across every peered spoke. Deploying Bastion in every
spoke multiplies cost and management overhead for no benefit.

## Private Link and PaaS connectivity

- Use **Private Endpoints** to connect to PaaS services (Storage, Key Vault, SQL, etc.) privately,
  eliminating public internet exposure for data-plane traffic.
- **Placement**: deploy a workload's private endpoints alongside that workload, in its own spoke —
  don't centralize them by default. Exception: shared/central services used by many workloads
  (e.g., a shared Key Vault or monitoring workspace) — put those private endpoints in a shared
  services spoke.
- Restrict access to a private endpoint from the hub or on-premises using an NSG on the subnet
  where the private endpoint is deployed.
- Central, consistent **Private DNS Zone** configuration (linked to every relevant VNet) is what
  makes Private Link actually resolve correctly — a very common failure mode is a private endpoint
  that exists but isn't resolvable from where the workload is trying to reach it.

## Egress (a 2026-critical change)

**As of March 31, 2026, new Azure virtual networks default to private subnets**
(`defaultOutboundAccess: false`). VMs/VMSS created without an explicit outbound method get **no**
implicit internet egress — the old behavior (an unpredictable, Microsoft-owned public IP assigned
automatically) is gone. This is a deliberate Zero Trust change: predictable, explicit, logged
egress instead of an invisible default.

Practical implication: **every workload subnet now needs an explicit, chosen egress path.**
Choose based on requirements:

- **NAT Gateway** attached to the workload subnet — simplest, predictable, scalable egress with a
  known set of static IPs, when you don't need FQDN-based filtering.
- **Azure Firewall** as the egress point (via the hub, forced-tunneled) — when you need FQDN-based
  filtering, centralized logging/inspection, or IDPS. Attach a NAT Gateway to the firewall subnet
  (or public IPs on the firewall itself) for the actual egress IPs.

When reviewing an existing VM/VMSS deployment or writing new IaC, explicitly check for and set the
outbound method — don't assume connectivity will "just work" the way it used to on older docs or
tutorials.

## Azure Firewall

- Stateful, managed network security service; typically the hub's central egress and inspection
  point for spoke-to-internet and spoke-to-spoke traffic.
- Can act as a DNS proxy to support FQDN-based rules, and can run network IDPS on inbound traffic.
- For multi-hub or cross-tenant topologies, Azure Firewall supports routing across a multi-hub
  setup; reduce the operational overhead of a self-managed hub-and-spoke with Azure Virtual
  Network Manager where the scale justifies it.

## NSGs and micro-segmentation

- Default-deny posture: require NSGs on every subnet, with explicit allow rules rather than broad
  permissive defaults. Azure networking is open by default without configuration — segmentation is
  something you add deliberately, not something that exists out of the box.
- Layer NSGs for micro-segmentation between tiers of an application (e.g., web tier cannot talk
  directly to the database tier except through the app tier) in addition to the hub/spoke boundary.
- Flow logs (NSG flow logs, and Azure Network Watcher/Connection Monitor for end-to-end
  validation) are the observability layer for network security — enable them before you need them
  for an incident, not after.
