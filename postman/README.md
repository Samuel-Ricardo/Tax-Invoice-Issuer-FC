# Postman API verification

> **Current source of truth — current as of 2026-08-25**
>
> Use this guide for API checks. Use the [Azure manual runbook](../docs/deploy/azure/manual/step-by-step-guide.md)
> for topology, identities, deployment, migration, and infrastructure
> troubleshooting. The JSON collection and environments are unchanged by this
> documentation consolidation.
>
> For historical incident context, see the [Azure deployment saga](../docs/deploy/azure/history/DEPLOYMENT-SAGA.md).
> It is not a current operational procedure.

## Files

- `Tax-Invoice-Issuer.postman_collection.json` — API collection.
- `Tax-Invoice-Issuer.postman_environment.json` — local environment.
- `Tax-Invoice-Issuer-Azure.postman_environment.json` — Azure environment with an
  observed URL that can become stale.

Do not store passwords, PATs, database URLs, or other secret values in Postman
files. Replace the Azure `baseUrl` before every runtime check.

## Test the Azure learning deployment

1. Import the collection and the Azure environment.
2. Select **Tax Invoice Issuer - Azure Learn-prod**.
3. Open `app-tax-invoice-fc-learn` in the Azure portal.
4. Copy the current **Application Url** from **Overview**.
5. Set `baseUrl` to that URL, including `https://` and excluding a trailing slash.
   Use `<POSTMAN_BASE_URL>` in notes.
6. Send:

   ```text
   GET {{baseUrl}}/
   ```

7. Require HTTP `200` and a JSON object equivalent to:

   ```json
   { "hello": "world" }
   ```

`GET /` is the current smoke test. The app has no `/health`, `/swagger`,
`/api-docs`, or live `/swagger.json` route. `npm run docs:swagger` generates a
local file only.

A green GitHub Actions run is not runtime acceptance. Verify the current
revision, image pull, Key Vault reference, private PostgreSQL connectivity, and
public URL separately as described in the [Azure runbook](../docs/deploy/azure/manual/step-by-step-guide.md).

## Invoice request

`POST /invoice` accepts:

| Field    | Required | Value or behavior                 |
| -------- | -------- | --------------------------------- |
| `month`  | Yes      | Number                            |
| `year`   | Yes      | Number                            |
| `type`   | Yes      | `cash` or `accrual`               |
| `format` | No       | Accepted intentionally as a no-op |

Example:

```bash
curl -i -X POST "<POSTMAN_BASE_URL>/invoice" \
  -H "Content-Type: application/json" \
  -d '{"month":1,"year":2024,"type":"cash"}'
```

The successful response is a structured JSON array serialized once. It is not an
escaped JSON string:

```json
[
  {
    "date": "<ISO_DATE>",
    "amount": 6000
  }
]
```

The final runtime Postman expectation is:

```javascript
const parsed = pm.response.json();
pm.expect(parsed).to.be.an("array");
```

Assert the parsed value, not only the raw response text. An empty array is still
a valid array response. The current behavior is represented by commits `f1b551c`
and `1927d73`.

`format: "pdf"` is accepted and intentionally does nothing. Do not expect a PDF
file, PDF content type, or a separate PDF implementation.

## Database-backed checks

The Azure migration Job executes only `migration/create.sql` through
`Dockerfile.migrations` and `migration/runner.sh`. It does not execute
`migration/versions/`. The SQL intentionally drops `sam` with `CASCADE`,
recreates the schema and tables, and seeds the 2022 fixture in one transaction.
**Every deployment resets and reseeds the database.**

This matters when interpreting results: `cash` with a 2024 date returning `[]` is
inconclusive against 2022 seed data. The observed accrual path returned three
invoices from the 2022 fixture. Use a request date aligned with that fixture when
checking data.

Before running invoice checks, confirm through the current runbook that:

- PostgreSQL is **Ready**;
- the application and database VNets are peered in both directions;
- the private DNS zone is linked to the application VNet;
- Key Vault secret `database-url` is mapped through `kv-database-url` to
  `DATABASE_URL` without exposing its value;
- the migration Job has private access to PostgreSQL;
- the `uuid-ossp` extension is allowed; and
- the database principal can connect to `<DATABASE_NAME>`, create objects, and
  drop/recreate the `sam` schema on each reset.

Do not claim that the presence of `migration/versions/` means those files ran.
Do not include a password or complete connection URL in a request, command, log,
screenshot, or commit.

## Collection runner

Run the root request first. Run invoice happy paths only after the migration and
private database prerequisites are verified.

1. Right-click **Tax Invoice Issuer - Full Coverage**.
2. Select **Run collection**.
3. Choose the intended environment.
4. Review results by boundary: HTTP smoke test, validation, and database-backed
   invoice behavior are separate evidence.

The collection's assertions are useful checks, but final runtime verification
must explicitly assert a parsed array for `POST /invoice`.

## QA evidence and limitations

GitHub Actions passed, and deployment, migration, and database connectivity were
verified from logs. The local E2E suite was blocked by a missing local
`DATABASE_URL`; do not report it as passed. Postman runtime checks are separate
and must be run against the current Application Url.

Some error paths can return HTTP `200` while the body reports `status: 500`.
Validation failures are expected to use HTTP `400`, but do not infer every runtime
error status from the response body. This is a known application limitation.

## Troubleshooting

| Symptom                                 | Check                                                                                                        |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Could not get response                  | Replace stale `baseUrl` with `<POSTMAN_BASE_URL>`, confirm public HTTPS ingress, and omit `:3000`            |
| HTTP `404` for `/health`                | Expected; use `GET /`                                                                                        |
| HTTP `404` for Swagger paths            | Expected; Swagger is generated locally, not served by the app                                                |
| `SecretError: DATABASE_URL is required` | Key Vault secret name/state, current system identity role, `kv-database-url`, and the `DATABASE_URL` mapping |
| Database connection failure             | PostgreSQL readiness, VNet peerings, private DNS link, private route, server FQDN, and migration Job logs    |
| Migration Job failure                   | Confirm it ran `migration/create.sql`, then check `uuid-ossp` allowlist and `<DATABASE_NAME>` privileges     |
| Schema does not match                   | Verify `sam` and its tables from an approved private administration path; the next deployment resets them    |
| Image pull failure after restart        | Use durable `GHCR_USERNAME` and `GHCR_READ_TOKEN`, not the expired workflow `GITHUB_TOKEN`                   |
| Empty 2024 cash result                  | Inconclusive against the 2022 fixture; align the request date with seeded data                               |
| PDF expectation fails                   | `format: "pdf"` is intentionally accepted as a no-op                                                         |

For the complete recovery steps and current Azure names, see the [manual
runbook](../docs/deploy/azure/manual/step-by-step-guide.md).

## Related documents

- [Azure manual deployment runbook](../docs/deploy/azure/manual/step-by-step-guide.md)
- [Azure deployment overview](../docs/deploy/azure/README.md)
- [Project documentation index](../docs/INDEX.md)
- [Project README](../README.md)
- [Historical Azure deployment saga](../docs/deploy/azure/history/DEPLOYMENT-SAGA.md)
