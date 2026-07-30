# ADR-001: Secrets Management Strategy

**Status**: PARTIALLY IMPLEMENTED  
**Date**: 2026-07-12 (Original) · 2026-07-28 (Updated)  
**Deciders**: Wilson (Architect), Carla (QA), Tiago (Development)  
**Supersedes**: None (First ADR on this topic)

---

## 1. Context

The Tax-Invoice-Issuer-FC project had **CRITICAL security gaps** in how secrets (database passwords, API keys, credentials) were managed.

### Original Problematic State (2026-07-12):

```
❌ Hardcoded password in source: "postgresql://postgres:123456@localhost:5432/postgres"
❌ Secrets mixed with code (env.config.ts)
❌ No abstraction layer (ConfigService)
❌ No type safety for secrets (plain string type)
❌ Debug logging can expose secrets (console.log)
❌ No rotation strategy (must redeploy to change password)
❌ TypeScript strict: false (allows implicit any)
❌ No pre-commit hook for secret detection
```

### Current State (2026-07-28):

| Item                                     | Original                                                  | Current                                                                  |
| ---------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------ |
| Hardcoded password in source             | ❌ `postgresql://postgres:123456@localhost:5432/postgres` | ✅ Removed                                                               |
| Secrets mixed with code (env.config.ts)  | ❌ Fallback to default                                    | ✅ Uses `requiredSecret("DATABASE_URL")` — throws `SecretError` if unset |
| ConfigService abstraction                | ❌ Not implemented                                        | ❌ Not implemented (direct ENV injection)                                |
| Secret branded type (`@types/secret.ts`) | ❌ Not implemented                                        | ❌ Not implemented                                                       |
| Debug logging can expose secrets         | ❌ `console.log`                                          | ⚠️ Logging exists without redaction                                      |
| Secret rotation strategy                 | ❌ Redeploy required                                      | ❌ Not implemented                                                       |
| TypeScript strict mode                   | ❌ `strict: false`                                        | ❌ `strict: false` (accepted — see Security Audit)                       |
| Pre-commit hook for secret detection     | ❌ Not implemented                                        | ❌ Not implemented (only `lint-staged` runs)                             |
| `SecretError` class                      | ❌ Not implemented                                        | ✅ Implemented at `@lib/error/secret.error.ts`                           |
| `.env.example` with placeholders         | ❌ Not implemented                                        | ✅ Created at project root                                               |
| `.env` + `.env.*` gitignored             | ⚠️ Partial                                                | ✅ `.env`, `.env.*` in `.gitignore` (except `*.example`)                 |
| GitHub Actions with secrets              | ❌ Not used                                               | ✅ `AZURE_CREDENTIALS`, `GITHUB_TOKEN` via GitHub Secrets                |
| pgAdmin exposed on all interfaces        | ❌ `0.0.0.0:5050`                                         | ✅ `127.0.0.1:5050` (localhost only)                                     |
| Docker secrets management                | ❌ Not configured                                         | ⚠️ Uses `env_file: .env` (basic, no Docker Secrets)                      |

### Vulnerability Status:

Based on the **[Security Audit verified 2026-07-28](SECURITY-AUDIT-SUMMARY.md)**:

| Severity    | Status                             |
| ----------- | ---------------------------------- |
| 🔴 CRITICAL | 0 vulnerabilities                  |
| 🟠 MEDIUM   | 3 optional items                   |
| 🟡 LOW      | 5 warnings/improvements            |
| **Score**   | **8/10** — ✅ SAFE FOR PUBLIC REPO |

### Environments Currently Supported:

| Environment   | Secret Source                                        | Status                                      |
| ------------- | ---------------------------------------------------- | ------------------------------------------- |
| Local Dev     | `.env` file                                          | ✅ Works (required — fails fast if missing) |
| Docker        | `.env` file via `env_file`                           | ✅ Works                                    |
| Azure Staging | GitHub Secrets → Container Apps                      | 🟡 Partial (no Key Vault)                   |
| Azure Prod    | GitHub Secrets → Container Apps                      | 🟡 Partial (no Key Vault / RBAC)            |
| CI/CD         | GitHub Secrets (`AZURE_CREDENTIALS`, `GITHUB_TOKEN`) | ✅ Configured                               |

---

## 2. Decision

Implement a **phased secrets management strategy**. Phase 0 (critical) is complete; remaining layers are future work.

### Phase 0: Emergency Hardening ✅ COMPLETED (2026-07-28)

A **simplified approach** was chosen for immediate critical fixes:

```typescript
// src/@modules/infra/config/env/env.config.ts
import { SecretError } from "../../../../@lib/error/secret.error";

function requiredSecret(secretName: string): string {
  const secret = process.env[secretName]?.trim();
  if (!secret) {
    throw new SecretError(`${secretName} is required`);
  }
  return secret;
}

export const ENV = {
  ...process.env,
  DATABASE: {
    URL: requiredSecret("DATABASE_URL"),
  },
};
```

**Why this approach was chosen over the full 3-layer plan:**

- Zero-config solution with immediate effect
- Fails fast at startup if secrets missing
- Uses custom `SecretError` for structured error handling
- No new abstractions — directly replaces the dangerous fallback
- `.env` files protect secrets from git

### Future Phases (Not Yet Implemented):

The original 3-layer strategy remains the target architecture:

#### Layer 1: Type System (Compile-Time Protection) 🔲 PLANNED

Create a `Secret` branded type:

```typescript
// @types/secret.ts (NOT YET CREATED)
export type Secret = string & { readonly __brand: 'Secret' };
export function isSecret(value: any): value is Secret { ... }
export function createSecret(value: string): Secret { ... }
```

Requires TypeScript `strict: true` — currently `false` (deferred).

#### Layer 2: ConfigService Abstraction (Runtime Protection) 🔲 PLANNED

Create a `@injectable()` `ConfigService` class wrapping env access:

```typescript
// @modules/infra/config/config.service.ts (NOT YET CREATED)
@injectable()
export class ConfigService {
  getDatabaseUrl(): Secret { ... }    // Returns Secret type
  get(key: string): string | undefined { ... }
}
```

Currently: config module injects `ENV.DATABASE.URL` directly as `string`.

#### Layer 3: Secret Redaction in Logging 🔲 PLANNED

Implement a logging layer that automatically redacts secrets:

```typescript
// @decorators/log/secure-logger.decorator.ts (NOT YET CREATED)
export function SecureLogger() { ... }  // Redacts password, token, key, url
```

Currently: `@decorators/log/data.decorator.ts` logs inputs/outputs without redaction.

---

## 3. Implementation Status

### ✅ Phase 0: Emergency Hardening (COMPLETED 2026-07-28)

| Task                                           | Status  | Details                                         |
| ---------------------------------------------- | ------- | ----------------------------------------------- |
| Remove hardcoded password from `env.config.ts` | ✅ DONE | `requiredSecret("DATABASE_URL")` — no fallback  |
| Create `SecretError` class                     | ✅ DONE | `@lib/error/secret.error.ts` extends `AppError` |
| Create `.env.example` template                 | ✅ DONE | Placeholders for all required variables         |
| Remove `postgres:123456` from all docs         | ✅ DONE | README, SETUP-GUIDE use `<POSTGRES_PASSWORD>`   |
| Update docker-compose to use `.env` files      | ✅ DONE | `env_file: .env` + environment variables        |
| Lock pgAdmin to localhost only                 | ✅ DONE | `127.0.0.1:5050` in docker-compose              |
| Configure CI/CD secrets                        | ✅ DONE | GitHub Actions uses `secrets.AZURE_CREDENTIALS` |
| Validate `.gitignore` for `.env` files         | ✅ DONE | `.env`, `.env.*` gitignored                     |

**Effort**: 4 hours  
**Security Score**: 8/10 ✅

### ⏳ Phase 1: Type System & ConfigService (DEFERRED)

| Task                                              | Status      | Notes                                             |
| ------------------------------------------------- | ----------- | ------------------------------------------------- |
| Enable `strict: true` in tsconfig.json            | ⏭️ DEFERRED | Per user decision, not pursued                    |
| Create `Secret` branded type                      | 🔲 PENDING  | Requires `strict: true`                           |
| Implement `ConfigService` class                   | 🔲 PENDING  | Would wrap current ENV pattern                    |
| Update `config.module.ts` to inject ConfigService | 🔲 PENDING  | Currently injects `ENV.DATABASE.URL` directly     |
| Migrate services to use ConfigService             | 🔲 PENDING  | PgPromiseConnectionAdapter injects `string` today |

**Effort**: 8 hours estimated  
**Risk**: Medium

### ⏳ Phase 2: Logging & Secret Redaction (DEFERRED)

| Task                                 | Status     | Notes                                                      |
| ------------------------------------ | ---------- | ---------------------------------------------------------- |
| Implement secret redaction decorator | 🔲 PENDING | `@decorators/log/data.decorator.ts` used without redaction |
| Replace `console.log/error` calls    | 🔲 PENDING | Currently uses `console.info/error` directly               |
| Add tests for logging redaction      | 🔲 PENDING | No redaction tests exist                                   |

**Effort**: 6 hours estimated  
**Risk**: Low

### ⏳ Phase 3: Azure Key Vault Integration (NOT STARTED)

| Task                                                  | Status     | Notes                     |
| ----------------------------------------------------- | ---------- | ------------------------- |
| Install `@azure/identity` + `@azure/keyvault-secrets` | 🔲 PENDING | Not installed             |
| Create `AzureConfigService`                           | 🔲 PENDING | Extends ConfigService     |
| Use Managed Identity                                  | 🔲 PENDING | Azure RBAC not configured |
| Implement secret rotation handler                     | 🔲 PENDING | Not designed              |
| Cache secrets with TTL                                | 🔲 PENDING | Not designed              |

**Effort**: 12 hours estimated  
**Risk**: Medium

---

## 4. Consequences

### Positive ✅

1. **Zero hardcoded secrets** — Critical vulnerability removed
2. **Fail-fast startup** — Missing secrets throw `SecretError` immediately
3. **Centralized error handling** — `SecretError` with status 500
4. **CI/CD ready** — GitHub Secrets configured for `AZURE_CREDENTIALS`
5. **Docker compatible** — Environment variables passed via `docker-compose`
6. **Git safe** — `.env` files protected by `.gitignore`

### Negative ❌

1. **No compile-time protection** — `Secret` branded type not implemented (`strict: false`)
2. **No abstraction layer** — Services inject `string` directly (PgPromiseConnectionAdapter)
3. **No log redaction** — `@InputLogger`/`@OutputLogger` can log secrets to console
4. **No Key Vault** — Not production-ready for enterprise Azure deployment
5. **No secret rotation** — Must redeploy to change database password
6. **No pre-commit secret scanning** — `lint-staged` only runs format/lint/test

### Risk Mitigation

| Risk                        | Mitigation                         | Status             |
| --------------------------- | ---------------------------------- | ------------------ |
| Hardcoded secrets in source | `requiredSecret("DATABASE_URL")`   | ✅ RESOLVED        |
| Secrets in git history      | `.gitignore` blocks `.env*`        | ✅ RESOLVED        |
| Public pgAdmin exposure     | Bind to `127.0.0.1`                | ✅ RESOLVED        |
| No secret type safety       | Deferred — requires `strict: true` | ⏱️ LOW PRIORITY    |
| Secrets in logs             | Deferred — requires SecureLogger   | ⏱️ LOW PRIORITY    |
| No Azure Key Vault          | Deferred — not in Azure yet        | ⏱️ MEDIUM PRIORITY |
| No rotation                 | Deferred — production hardening    | ⏱️ MEDIUM PRIORITY |

---

## 5. Alternatives Considered

### Alternative 1: ❌ Current State (Hardcoded + env override)

**Decision**: REJECTED — The original approach was the problem this ADR aims to fix.

### Alternative 2: ❌ Secrets in Database

**Decision**: REJECTED — Circular dependency (need password to access the database that stores passwords).

### Alternative 3: ⚠️ .env.local Only

**Decision**: REJECTED FOR PRODUCTION — Used only as local dev pattern. Doesn't work in CI/CD or Docker reliably.

### Alternative 4: ✅ Phase 0: requiredSecret + SecretError (CHOSEN for now)

**Pros**:

- ✅ Zero-config, immediate fix
- ✅ Fails fast at startup
- ✅ Uses custom error type
- ✅ No build/deploy changes needed

**Cons**:

- ⚠️ No compile-time type safety
- ⚠️ No log redaction
- ⚠️ Manual rotation

### Alternative 5: 🔲 Full ConfigService + Azure Key Vault (TARGET)

**Decision**: ACCEPTED AS FUTURE TARGET — Will implement when deploying to Azure Production.

---

## 6. Timeline — Actual vs Planned

```
Week 0 (2026-07-28) — EMERGENCY FIX:
  ✅ Remove hardcoded password from env.config.ts
  ✅ Create SecretError class
  ✅ Create .env.example
  ✅ Sanitize documentation (README, SETUP-GUIDE)
  ✅ Lock pgAdmin to localhost
  ✅ Verify .gitignore
  ✅ Update ADR-001 with current state

=== Gap — Low priority items below ===

Future Sprint:
  🔲 Enable strict mode + Secret type
  🔲 Implement ConfigService
  🔲 Implement SecureLogger decorator
  🔲 Implement Azure Key Vault integration
  🔲 Implement secret rotation
  🔲 Implement pre-commit secret scanning

TOTAL COMPLETED: ~4 hours (emergency hardening, 2026-07-28)
TOTAL REMAINING: ~30 hours (all future phases)
```

---

## 7. Testing Strategy

### Current Tests (Phase 0):

```typescript
// Currently tested through integration:
// - Startup fails with SecretError if DATABASE_URL is missing
// - Startup succeeds when DATABASE_URL is set in .env or environment
```

### Future Tests (Planned):

```typescript
describe("ConfigService", () => {
  it("should return database URL as Secret type", () => {
    const service = new ConfigService(mockEnv);
    const url = service.getDatabaseUrl();
    expect(url).toBeDefined();
  });

  it("should fail startup if DATABASE_URL missing", () => {
    expect(() => new ConfigService({})).toThrow("Missing required secrets");
  });

  it("should redact secrets in error logs", () => {
    const logged = redactSecrets({ password: "secret123", normal: "value" });
    expect(logged.password).toBe("[REDACTED]");
    expect(logged.normal).toBe("value");
  });
});
```

---

## 8. Compliance & Audit

Current compliance:

- ✅ **OWASP A02:2021 — Cryptographic Failures**: Hardcoded password removed
- ✅ **OWASP A08:2021 — Software and Data Integrity Failures**: No fallback secrets
- ✅ **Twelve-Factor App — Config**: Secrets from environment, not code
- ⏱️ **Azure Key Vault**: Not yet implemented
- ⏱️ **PCI DSS 3.2/3.4/8.2**: Not yet applicable (no payment processing today)

---

## 9. References

- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [Azure Key Vault Best Practices](https://learn.microsoft.com/en-us/azure/key-vault/general/best-practices)
- [The Twelve-Factor App — Config](https://12factor.net/config)
- [NIST SP 800-57 — Key Lifecycle](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-57pt1r5.pdf)
- [Security Audit Summary](SECURITY-AUDIT-SUMMARY.md)

---

## 10. Sign-Off

**Proposed By**: Wilson — Solution Architect  
**Original Date**: 2026-07-12  
**Emergency Fix Completed**: 2026-07-28  
**Status**: PARTIALLY IMPLEMENTED (Phase 0 complete, future phases deferred)

**Verification**:

- ✅ Hardcoded password removed — verified 2026-07-28
- ✅ `env.config.ts` uses `requiredSecret()` — verified 2026-07-28
- ✅ `.env.example` with placeholders — verified 2026-07-28
- ✅ pgAdmin bound to localhost — verified 2026-07-28
- ✅ `.gitignore` protects `.env*` — verified 2026-07-28

**Next Steps**:

- [ ] Move Phase 1-3 items to product backlog when prioritized
- [ ] Enable `strict: true` when TypeScript strict mode is accepted
- [ ] Implement `Secret` type + `ConfigService` before Azure production deployment
- [ ] Implement `SecureLogger` decorator for log redaction
- [ ] Implement Azure Key Vault integration when deploying to Azure
