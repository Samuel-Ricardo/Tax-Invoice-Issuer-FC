# Security Fix Guide — Tax Invoice Issuer

**How each of the 7 critical/high vulnerabilities from [SECURITY-AUDIT-SUMMARY.md](SECURITY-AUDIT-SUMMARY.md) was fixed, with before/after code and verification steps.**
All fixes below were **applied and validated** on November 5–6, 2025 (`fix/security-audit-2025`); verified in [SECURITY-AUDIT-FINAL-REPORT.md](SECURITY-AUDIT-FINAL-REPORT.md).

---

## V1 — Azure OIDC without organizational restrictions (Critical, CVSS 9.1)

**File:** `.github/workflows/login/action.yml`

**Before ❌**

```yaml
audience: "api://AzureADTokenExchange"
# any organization could request a token
```

**After ✅**

```yaml
audience: "api://AzureADTokenExchange"
subject: "repo:Samuel-Ricardo/Tax-Invoice-Issuer-FC:ref:refs/heads/main"
```

**Verify:** run a workflow and confirm the login step fails from a fork/different repo, succeeds from `main`.

---

## V2 — Terraform state without locking (Critical, CVSS 8.2)

**File:** `infra/terraform/backend.hcl`

**After ✅**

```hcl
storage_account_name = "yourstatestorage"
container_name       = "tfstate"
key                  = "prod.terraform.tfstate"
use_azuread_auth     = true
```

**Verify:** `terraform init -backend-config=backend.hcl` succeeds; two simultaneous `terraform plan` runs do not corrupt state (Azure blob lease provides the lock).

---

## V3 — CodeQL workflow without secret/permission validation (Critical)

**File:** `.github/workflows/code-analyzer.yaml`

**Fix:** the job now validates required secrets/inputs at startup and fails fast with a clear message instead of running unauthenticated.

**Verify:** trigger the workflow without the required secrets → job must fail fast with the validation error.

---

## V4 — Treasury image without registry pinning (Critical)

**File:** `docker-compose.yml`

**Before ❌**

```yaml
image: ghcr.io/your-org/treasury:main
```

**After ✅**

```yaml
image: ghcr.io/your-org/treasury:v1.2.3@sha256:<digest>
```

---

## V5 — Storage without soft delete (Medium)

**File:** `infra/modules/storage.bicep`

**After ✅**

```bicep
properties: {
  deleteRetentionPolicy: { enabled: true, days: 7 }
}
```

---

## V6 — Zod 3 → 4 validation upgrade (Critical, deprecated APIs)

The application used deprecated Zod 3 APIs. Migrated to Zod 4 idioms:

```typescript
// Before (Zod 3) ❌
z.string().email();
error.errors;

// After (Zod 4) ✅
z.email();
error.issues;
z.array(schema); // .array() helper usage updated; email list validated as z.array(emailEntrySchema)
```

The email flow now parses the invoice payload through `ZodEmailSpecification` with `z.coerce.date()` and `z.number()`, throwing `ValidationDataError` (HTTP 400) on failure.

**Verify:** `npm run test -- zod` and the schema tests under `test/unit/infra/validator/` + `test/unit/application/service/` all pass.

---

## V7 — Scripts without input validation / unsafe deletion (High)

- `scripts/setup.ps1`: user input now validated before use.
- `scripts/cleanup.ps1`: destructive wildcard removal replaced with explicit confirmations.

---

## Automated verification

```bash
npm test                 # full suite — 34 spec files / 226 tests
npm run code:ci          # format + lint + tests
npm start                # boot app, then:
curl http://localhost:3000/            # {"hello":"world"}
curl -X POST http://localhost:3000/invoice \
  -H "Content-Type: application/json" \
  -d '{"month":1,"year":2022,"type":"cash"}'
```

Invalid payloads (e.g. `type: "semestral"`, `month: "abc"`) must return **400** with the Zod issue list.

## Manual verification checklist

- [ ] OIDC login rejected from fork, accepted from main
- [ ] Terraform lock prevents concurrent state writes
- [ ] CodeQL workflow fails fast without secrets
- [ ] Docker pulls only the pinned digest
- [ ] Deleted blob recoverable within 7 days
- [ ] Invalid invoice payload → 400 with zod `issues`
- [ ] setup/cleanup scripts reject malformed input

## References

- [OWASP Top 10:2021](https://owasp.org/Top10/)
- [CWE Top 25:2023](https://cwe.mitre.org/top25/)
- [Zod 4 migration](https://zod.dev/v4)
- [GitHub Actions security hardening](https://docs.github.com/actions/security-guides/security-hardening-for-github-actions)

---

_Translated to English and synchronized with the code on 2026-09-02._
