# Postman test collection

Use this guide to test the local API or the current Azure learning deployment.
The [Azure manual runbook](../docs/deploy/azure/manual/step-by-step-guide.md) is
the source of truth for infrastructure, identities, networking, and deployment.

## Files

- `Tax-Invoice-Issuer.postman_collection.json` — API collection.
- `Tax-Invoice-Issuer.postman_environment.json` — local environment.
- `Tax-Invoice-Issuer-Azure.postman_environment.json` — Azure environment
  template with an observed, potentially stale Application Url.

## Test the Azure learning deployment

1. Import the collection and `Tax-Invoice-Issuer-Azure.postman_environment.json`.
2. Select **Tax Invoice Issuer - Azure Learn-prod**.
3. Open the Azure Container App `app-tax-invoice-fc-learn` in the Portal.
4. On **Overview**, copy the current **Application Url**.
5. Update the Postman environment variable `baseUrl` with that URL, including
   `https://` and excluding a trailing slash.
6. Save the environment.
7. Send:

   ```text
   GET {{baseUrl}}/
   ```

8. Confirm HTTP `200` and:

   ```json
   { "hello": "world" }
   ```

The Application Url can change when Azure recreates the app. Do not rely on the
FQDN committed in the environment JSON. Do not put a database URL, password, PAT,
or other secret in the environment file.

`GET /` is the current HTTP smoke test. There is no `/health` route. The
application also does not serve `/swagger`, `/api-docs`, or `/swagger.json`.
`npm run docs:swagger` generates a local `docs/swagger.json` file only.

## Test locally

1. Select **Tax Invoice Issuer - Local**.
2. Confirm `baseUrl` is `http://localhost:3000`.
3. Start the application using the project instructions.
4. Send `GET {{baseUrl}}/` and expect HTTP `200` with
   `{"hello":"world"}`.

## Optional invoice requests

The Azure `POST /invoice` happy path requires more than a successful root
request. Before running it, confirm that:

- PostgreSQL is **Ready**;
- the application and database VNets are peered in both directions;
- `psql-tax-invoice-fc-learn.private.postgres.database.azure.com` is linked to
  `vnet-tax-invoice-fc` as `link-app-vnet`, with auto-registration disabled;
- Key Vault secret `database-url` contains the complete URL with
  `sslmode=require`;
- the Container App maps `DATABASE_URL` to Key Vault-backed secret
  `kv-database-url`; and
- the configured Container Apps migration Job has successfully run the additive
  files in `migration/versions/` from a host with access to the private VNet.

The application does not assemble `DATABASE_URL` from separate
`DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_NAME`, and
`DATABASE_PASSWORD` variables. A password-only secret is not sufficient.

Use the current Application Url from the Portal:

```bash
curl -i -X POST "https://<CURRENT_APP_FQDN>/invoice" \
  -H "Content-Type: application/json" \
  -d '{"month":1,"year":2024,"type":"cash"}'
```

Never include the database password in a request, shell command, log, screenshot,
or commit.

## Collection runner

The collection contains validation and invoice scenarios. Run the root request
first. Run the database-backed happy-path requests only after the optional Azure
schema setup is complete.

1. Right-click **Tax Invoice Issuer - Full Coverage**.
2. Select **Run collection**.
3. Choose the intended environment.
4. Review each result and separate HTTP smoke-test failures from database
   configuration failures.

## Troubleshooting

| Symptom                                                 | Check                                                                                                                |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Could not get response                                  | `baseUrl` is the current Portal Application Url; public ingress is enabled; no `:3000` suffix is present             |
| HTTP `404` for `/health`                                | Expected: use `GET /`                                                                                                |
| HTTP `404` for Swagger paths                            | Expected: Swagger is generated locally, not served by the application                                                |
| HTTP `500` with `SecretError: DATABASE_URL is required` | Runtime identity, Key Vault secret `database-url`, `kv-database-url`, and the `DATABASE_URL` mapping                 |
| Database connection failure                             | PostgreSQL readiness, VNet peerings, private DNS link, VNet reachability, URL-encoded password, and schema readiness |
| Image pull errors after restart                         | Container Apps must use durable `GHCR_USERNAME` and `GHCR_READ_TOKEN`, not the expired workflow `GITHUB_TOKEN`       |

A green GitHub Actions run does not prove that the running revision can pull the
image, read Key Vault, reach PostgreSQL, or serve the current public URL. Verify
those boundaries in the Portal and with `GET {{baseUrl}}/`.
