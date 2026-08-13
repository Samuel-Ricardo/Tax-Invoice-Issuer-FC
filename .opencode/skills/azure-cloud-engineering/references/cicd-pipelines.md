# CI/CD to Azure: GitHub Actions, Azure DevOps, OIDC

Load this file when: wiring a pipeline to deploy to Azure, reviewing pipeline authentication, or
designing approval gates for Azure deployments.

## Default authentication: OIDC / Workload Identity Federation

**Do not use client secrets for pipeline-to-Azure authentication in 2026.** Workload Identity
Federation (WIF) is the supported, default pattern for both GitHub Actions and Azure DevOps, and
has been for years at this point — GitHub Actions has supported it since 2021, Azure DevOps
service connections went GA with WIF in February 2024, and the `azurerm` Terraform provider has
supported it since v3.7. If you find a pipeline still using `ARM_CLIENT_SECRET` or an equivalent
long-lived credential, flag it as a security finding and propose migration — this is precisely the
class of credential most likely to leak (screenshotted variable groups, echoed pipeline logs,
secrets inherited by a fork, or simply expiring unnoticed and taking a production deploy down with
it on expiry).

**How it works**: the CI system (GitHub or Azure DevOps) signs a short-lived JWT describing exactly
what's running (repo, branch, environment/service connection). That JWT is exchanged with
Microsoft Entra ID against a federated identity credential configured on a managed identity or app
registration; Entra validates the `iss`, `sub`, and `aud` claims (case-sensitively) and, if they
match, issues a short-lived Azure access token for the duration of the job. Nothing persists after
the job ends — no secret is stored, requested, or rotated.

- **Target identity**: use a **user-assigned managed identity**, not an app registration/service
  principal secret and not a system-assigned identity tied to a single resource's lifecycle — a
  user-assigned identity survives pipeline/resource churn and gives one place to manage role
  assignments.
- **Subject claim format differs by platform** — this is a common source of "authentication
  silently fails" bugs:
  - GitHub Actions: `repo:<org>/<repo>:environment:<environment-name>` (or branch-based variants).
  - Azure DevOps: `sc://<org>/<project>/<service-connection-name>`.
    Get this exact string wrong and the token exchange fails with a generic auth error — always
    verify the subject claim matches the actual trigger context (environment name, branch, etc.)
    before debugging anything else.

### GitHub Actions example

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production # binds this job to the "production" Environment's federated credential
    permissions:
      id-token: write # required to request the OIDC token
      contents: read
    steps:
      - uses: azure/login@v3
        with:
          client-id: ${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
```

```bash
# Registering the federated credential on the target managed identity / app registration
az ad app federated-credential create \
  --id <appId> \
  --parameters '{
    "name": "github-actions-production",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:<org>/<repo>:environment:production",
    "audiences": ["api://AzureADTokenExchange"]
  }'
```

## Approval placement — put it where it can't be bypassed

- **GitHub**: use **Environments** with required reviewers on `production`. The OIDC credential is
  scoped to that environment, so even a branch-protection bypass can't obtain a production Azure
  token without the environment approval also being satisfied — the identity binding _is_ part of
  the control, not just the approval UI.
- **Azure DevOps**: put the approval on the **service connection**, not (only) on the Environment
  record. An Environment-only approval can be routed around by a sufficiently clever pipeline
  author restructuring the YAML; an approval bound to the service connection cannot be bypassed by
  pipeline authoring choices.
- **Governed/reusable pipeline templates**: keep shared pipeline templates in a separate,
  locked-down repository, and pin federated credentials/service connections to those specific
  templates (via the `job_workflow_ref` claim on GitHub, or required-template checks on Azure
  DevOps). If someone forks the workflow, the OIDC exchange refuses to issue a token — the
  template itself becomes part of the trust boundary, not just a convenience.

## Pipeline quality gates (ties back to the base agent's release workflow)

A production-bound Azure deployment pipeline should, before any `apply`/deployment step:

1. Run static analysis and policy-as-code checks against the IaC plan/what-if output
   (see `iac-bicep-terraform.md`).
2. Run dependency, secret, and container image scanning on anything being deployed.
3. Require the plan/what-if diff to be visible to the human approver at approval time — an
   approval on a step that doesn't show what's about to change isn't a meaningful control.
4. Deploy progressively where the target supports it (e.g., AKS canary/blue-green, App Service
   deployment slots) rather than a single all-at-once cutover, with a stated rollback trigger
   defined _before_ the rollout starts.

## Azure DevOps vs. GitHub Actions — when it matters

Both platforms support the same OIDC pattern and integrate cleanly with Bicep and Terraform; the
choice is usually driven by where the rest of the org's source control and work tracking already
lives, not by a meaningful capability gap for Azure deployment specifically. Azure DevOps YAML
pipelines have somewhat more mature built-in approval/checks primitives tied to service
connections; GitHub Actions has a larger third-party action ecosystem and tighter integration if
the org is already on GitHub for source control. Don't recommend a platform migration purely to
gain Azure-specific capability — it's rarely the deciding factor.
