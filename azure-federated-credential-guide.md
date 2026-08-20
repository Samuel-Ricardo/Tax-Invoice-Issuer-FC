# Replacing an Azure AD Federated Credential for Workload Identity Federation

## Problem Summary

Your GitHub Actions workflow (`docker-publish.yaml`) deploys to Azure Container Apps in `rg-tax-invoice-fc` using Workload Identity Federation (WIF) with `environment: production` configured in the workflow job.

**Error:** `AADSTS70025: client has no configured federated identity credentials`

**Root Cause:** GitHub changed the OIDC `sub` (subject) claim format when a workflow job uses `environment:`:

| Workflow Config           | Subject Claim Issued by GitHub                                     |
| ------------------------- | ------------------------------------------------------------------ |
| No `environment:`         | `repo:Samuel-Ricardo/Tax-Invoice-Issuer-FC:ref:refs/heads/main`    |
| `environment: production` | `repo:Samuel-Ricardo/Tax-Invoice-Issuer-FC:environment:production` |

Your federated credential was registered with the ref-scoped subject (`ref:refs/heads/main`). GitHub is now sending the environment-scoped subject (`environment:production`), and Azure rejects it because the strings must match **exactly**.

---

## What You'll Do

1. Locate your **App Registration** (or User-Assigned Managed Identity) in the Azure Portal
2. Navigate to **Federated credentials**
3. **Delete** the existing credential with the wrong subject claim
4. **Create** a new federated credential with the environment-scoped subject
5. Wait for propagation and verify the workflow succeeds

---

## Step-by-Step Guide

### Step 1 — Open the Azure Portal and Find Your App Registration

1. Open **[https://portal.azure.com](https://portal.azure.com)** in your browser.
2. Sign in with your Microsoft account that has permissions on the target subscription.
3. In the top search bar, type **"Microsoft Entra ID"** (or "Azure Active Directory" — the portal still shows both names).
4. Click the **Microsoft Entra ID** service entry in the results.

> **Why this matters:** Federated credentials live on App Registrations in Microsoft Entra ID. You need to navigate to the right app. If your setup uses a **User-Assigned Managed Identity** instead of an App Registration, skip ahead to the "On a User-Assigned Managed Identity" subsection below.

#### If You Don't Know the Exact App Registration Name

5. Under **Manage** in the left-hand navigation, click **App registrations**.
6. In the list of app registrations, look for one matching your setup. Common naming patterns:
   - `mi-tax-invoice-fc-github`
   - `tax-invoice-fc-github`
   - `Tax-Invoice-Issuer-FC`
   - Any name you used when you originally created the federated credential
7. If you're unsure, you can open each one and check the **Federated credentials** blade — the existing credential will show its name, subject, and issuer.

> **Gotcha:** An App Registration and a User-Assigned Managed Identity are **different resource types** in Entra ID. The federated credential might be on one or the other (or both, if you followed a guide that set it up on the App Registration). If you followed a Microsoft Learn article that says "create a federated credential on a **user-assigned managed identity**," then it's on the MI, not the App Registration. See the MI-specific steps below.

---

### Step 1b — On a User-Assigned Managed Identity (If That's Where Your Credential Lives)

If your federated credential was created on a **User-Assigned Managed Identity** (not an App Registration):

1. In the Azure Portal, navigate to your resource group:
   - Click **Resource groups** in the left navigation.
   - Select **rg-tax-invoice-fc** from the list.
2. On the resource group blade, click **Managed identities** in the left sidebar.
3. Find your managed identity in the list (likely named `mi-tax-invoice-fc-github` or similar).
4. Click on the managed identity name to open it.
5. In the left sidebar under **Settings**, click **Federated credentials**.

> **Why:** The federated credential is attached to the managed identity object in Entra ID, not the App Registration. The portal navigation is different.

---

### Step 2 — Locate the Existing Federated Credential

#### On an App Registration:

1. You're now on the App Registration blade. In the left sidebar under **Manage**, click **Federated credentials**.
2. You'll see a list of federated credentials. Look for the one that was previously working. It will show:
   - **Name:** e.g., `GitHub Actions - main` or `GitHub Actions`
   - **Federated credential type:** Likely `GitHub Actions deploying Azure resources` (this pre-configures the issuer and audience for you)
   - **Subject identifier:** `repo:Samuel-Ricardo/Tax-Invoice-Issuer-FC:ref:refs/heads/main`

#### On a User-Assigned Managed Identity:

1. Same view — you'll see the list with the existing credential and its subject identifier.

> **Why this step matters:** You need to confirm exactly which credential needs to go. The **Name** field of a federated credential is **immutable** — you cannot rename it after creation. This is why we must delete and recreate rather than "edit."

---

### Step 3 — Delete the Existing Credential

#### On an App Registration:

1. On the **Federated credentials** blade, find the existing credential (the one with the ref-scoped subject).
2. Check the checkbox next to it (or click directly on the credential name to expand it).
3. Click the **Delete** button (trash icon) at the top of the list.
4. Confirm the deletion when prompted.

#### On a User-Assigned Managed Identity:

1. Same process — find the credential, click **Delete**, confirm.

> **Why delete first?** Since you can't rename a federated credential, and the subject claim changed, the only way to update it is to delete the old one and create a new one. You can delete and recreate in the same session — Azure doesn't require a waiting period between the two actions.

---

### Step 4 — Create the New Federated Credential

#### On an App Registration:

1. You're still on the App Registration's **Federated credentials** blade.
2. Click **+ Add credential** at the top of the list.
3. A panel will slide out from the right. Select **GitHub Actions deploying Azure resources** from the **Federated credential scenario** dropdown.

   This pre-fills the **Issuer** (`https://token.actions.githubusercontent.com`) and **Audiences** (`api://AzureADTokenExchange`) fields for you — don't change these.

4. Now fill in the remaining fields:

   | Field                       | Value                                                               | Notes                                                                                                                                                        |
   | --------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
   | **Name**                    | `GitHub Actions - environment` (or any descriptive name you prefer) | This is the only field you choose freely. It's immutable after creation, so pick something clear.                                                            |
   | **Repository**              | `Samuel-Ricardo/Tax-Invoice-Issuer-FC`                              | Use the **Select** button to browse your GitHub org/repos. This auto-fills the subject claim.                                                                |
   | **GitHub environment name** | `production`                                                        | **This is the critical change.** Select this from the dropdown instead of leaving it blank. This tells Azure to expect the environment-scoped subject claim. |

5. Click **Add** at the bottom of the panel.

#### On a User-Assigned Managed Identity:

1. You're on the managed identity's **Federated credentials** blade.
2. Click **+ Add credential** at the top.
3. Select **GitHub Actions deploying Azure resources** from the scenario dropdown.
4. Fill in:

   | Field                       | Value                                  |
   | --------------------------- | -------------------------------------- |
   | **Name**                    | `GitHub Actions - environment`         |
   | **Repository**              | `Samuel-Ricardo/Tax-Invoice-Issuer-FC` |
   | **GitHub environment name** | `production`                           |

5. Click **Add**.

> **Why these values matter:**
>
> - **Repository** auto-generates the subject claim prefix (`repo:Samuel-Ricardo/Tax-Invoice-Issuer-FC:`).
> - **GitHub environment name: production** appends `environment:production` to the subject claim, producing: `repo:Samuel-Ricardo/Tax-Invoice-Issuer-FC:environment:production`
> - **Issuer** (`https://token.actions.githubusercontent.com`) must match exactly — GitHub's OIDC tokens use this `iss` claim. Azure uses it to fetch signing keys.
> - **Audiences** (`api://AzureADTokenExchange`) is the Azure AD token exchange audience — required for federated identity token exchange.

> **Gotcha — The Name is immutable:** Once you click Add, you **cannot rename** the federated credential. If you pick a confusing name now, you'll be stuck with it forever. Pick something you'll recognize in 6 months.

> **Gotcha — Maximum 20 credentials:** An App Registration or User-Assigned Managed Identity can hold a maximum of **20 federated identity credentials** each. If you're adding new ones frequently, keep track of what's active and delete stale entries.

---

### Step 5 — Verify the New Credential Was Created

1. After clicking **Add**, the panel closes and you'll see your new credential in the list.
2. Confirm it shows:
   - **Subject identifier:** `repo:Samuel-Ricardo/Tax-Invoice-Issuer-FC:environment:production`
   - **Issuer:** `https://token.actions.githubusercontent.com`
   - **Audiences:** `api://AzureADTokenExchange`
   - **Name:** The name you chose (e.g., `GitHub Actions - environment`)

---

### Step 6 — Wait for Propagation

> **Critical:** Federated credential changes take time to propagate across Azure's authorization service nodes.

- Wait **at least 5–10 minutes** before re-running your workflow.
- Microsoft recommends adding **retry logic** for token requests during this window, since some nodes may still have cached old data.

> **What happens if you don't wait:** You may see `AADSTS70021: No matching federated identity record found for presented assertion.` even though the credential is correctly configured. This is a cache-replication issue, not a configuration problem.

---

### Step 7 — Re-Run the Workflow and Verify

1. Go to your GitHub repository: **Samuel-Ricardo/Tax-Invoice-Issuer-FC**.
2. Navigate to **Actions** → find your `docker-publish` workflow run.
3. Click **Re-run all jobs** on the failed run, or trigger a new push to `main`.
4. Watch the workflow output. Look for the step where it authenticates to Azure — it should now succeed and show something like:
   ```
   Azure CLI 2.x logged into ...
   ```
   or the `Azure/login` action should report successful authentication.

---

## Verification Checklist

After re-running the workflow, confirm all of the following:

- [ ] The workflow authenticates to Azure without `AADSTS70025` or `AADSTS70021` errors.
- [ ] The deploy step completes (the workflow finishes successfully or reaches the deployment step).
- [ ] The Container Apps environment shows the new image/version (if the workflow deploys).
- [ ] In the Azure Portal → Microsoft Entra ID → App registrations (or User-Assigned MI) → Federated credentials, you see only the **new** credential with the `environment:production` subject. The old ref-scoped one should be gone.

---

## Gotchas & Common Pitfalls

### 1. Federated credential Name is immutable

You cannot rename a federated credential after creation. Always pick a descriptive, future-proof name. If you mess up the name, the only fix is to delete and recreate.

### 2. Subject claim must match EXACTLY

GitHub's OIDC `sub` claim is a string. Azure compares it as an exact string match against the federated credential's subject field. Even a single character difference (trailing space, different casing) causes `AADSTS70025`.

### 3. Don't confuse App Registration vs. User-Assigned Managed Identity

These are two different resource types in Entra ID. The federated credential lives on one or the other. If you created it via the App Registration path, it's on the App Registration. If via the MI path, it's on the MI. Having the credential in the wrong place won't help.

### 4. Propagation delay after creating/deleting

After adding or deleting a federated credential, wait 5–10 minutes before testing. The authorization service caches credential data across nodes. Test too early and you get `AADSTS70021`.

### 5. The old ref-scoped credential doesn't auto-update

Adding a new environment-scoped credential does **not** replace the old ref-scoped one. They are independent credentials. You **must** delete the old one explicitly if you no longer need it.

### 6. Multiple credentials for different branches/environments

You can have multiple federated credentials on the same App Registration or MI. Each one is independent and matches a different subject claim. This is how you support both branch pushes AND environment deployments.

### 7. Maximum 20 credentials per resource

If you create too many, you'll hit the 20-credential limit. Clean up stale credentials periodically.

---

## Supporting Both Formats (Branch Push + Environment Deployment)

If you want your workflow to support **both** regular branch pushes (no `environment:`) **and** environment-scoped deployments (`environment: production`), you need **two federated credentials** on the same App Registration or User-Assigned Managed Identity:

| #   | Name                           | Subject Identifier                                                 | When It Matches                              |
| --- | ------------------------------ | ------------------------------------------------------------------ | -------------------------------------------- |
| 1   | `GitHub Actions - main`        | `repo:Samuel-Ricardo/Tax-Invoice-Issuer-FC:ref:refs/heads/main`    | Workflow runs without `environment:`         |
| 2   | `GitHub Actions - environment` | `repo:Samuel-Ricardo/Tax-Invoice-Issuer-FC:environment:production` | Workflow runs with `environment: production` |

### How to set this up:

1. **Keep** the existing ref-scoped credential (or recreate it if you already deleted it):
   - Scenario: **GitHub Actions deploying Azure resources**
   - Repository: `Samuel-Ricardo/Tax-Invoice-Issuer-FC`
   - **No** GitHub environment name selected
   - Name: `GitHub Actions - main`

2. **Add** the environment-scoped credential (as described in Steps 4–5 above):
   - Scenario: **GitHub Actions deploying Azure resources**
   - Repository: `Samuel-Ricardo/Tax-Invoice-Issuer-FC`
   - GitHub environment name: `production`
   - Name: `GitHub Actions - environment`

3. Both credentials will be listed, each matching a different `sub` claim format.

> **Why this works:** Azure evaluates **all** federated credentials on the resource. If the incoming token's `sub` claim matches **any** one of them, authentication succeeds. Having both allows your workflow to work regardless of whether `environment:` is specified.

---

## If You Still Get Errors After This

| Error                                                                              | Likely Cause                                       | Fix                                                                                                                                       |
| ---------------------------------------------------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `AADSTS70025: client has no configured federated identity credentials`             | The `sub` claim still doesn't match any credential | Double-check the subject claim GitHub is sending. Check your workflow YAML for `environment:` configuration.                              |
| `AADSTS70021: No matching federated identity record found for presented assertion` | Propagation delay — you tested too soon            | Wait 5–10 more minutes and retry.                                                                                                         |
| `AADSTS7000227: The requested application... was not found`                        | Wrong App Registration / tenant                    | Confirm you're looking at the right tenant and app.                                                                                       |
| Workflow still fails with `401` or `403`                                           | Credential is correct but RBAC is missing          | Confirm the managed identity or app has the right Azure role (e.g., `Contributor` or `Container App Contributor`) on `rg-tax-invoice-fc`. |

### Checking RBAC Assignment

1. Go to the Azure Portal → **Resource groups** → **rg-tax-invoice-fc**.
2. Click **Access control (IAM)** in the left sidebar.
3. Look for your managed identity or App Registration in the role assignments.
4. If it's missing, click **+ Add** → **Add role assignment** → Select the appropriate role (e.g., **Contributor** or **Container App Contributor**) → Assign to your managed identity or app registration.

---

## TL;DR (Quick Version)

1. **Portal → Microsoft Entra ID → App registrations** (or **Resource groups → rg-tax-invoice-fc → Managed identities** → your MI).
2. Click **Federated credentials**.
3. **Delete** the old credential with subject `repo:Samuel-Ricardo/Tax-Invoice-Issuer-FC:ref:refs/heads/main`.
4. Click **+ Add credential** → **GitHub Actions deploying Azure resources**.
5. Repository: `Samuel-Ricardo/Tax-Invoice-Issuer-FC` | Environment: `production`.
6. Click **Add**.
7. Wait **5–10 minutes** for propagation.
8. Re-run the GitHub Actions workflow.
