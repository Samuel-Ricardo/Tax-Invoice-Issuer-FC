# API Reference

> Verified against source on 2026-09-02. Base URL (local): `http://localhost:3000`.

## Endpoints

| Method | Path       | Purpose                                                                                                                                           | Body         |
| ------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| `GET`  | `/`        | Health check                                                                                                                                      | —            |
| `POST` | `/invoice` | Generate tax invoices for all contracts in a given month/year, then **email them** (via internal event → MailHog/SMTP)                            | `InvoiceDTO` |
| `GET`  | `/docs`    | Swagger UI — ⚠️ **known issue**: redirect loop (swagger-ui-express + Express 5 serving the `""` route). Use `docs/swagger.json` / Postman instead | —            |

---

## `GET /`

**Response `200`** (through the JSON presenter):

```json
{ "hello": "world" }
```

```bash
curl http://localhost:3000/
```

---

## `POST /invoice`

### Request body — `InvoiceDTO`

| Field    | Type    | Required | Constraint                                                |
| -------- | ------- | -------- | --------------------------------------------------------- |
| `month`  | integer | ✅       | 1–12                                                      |
| `year`   | integer | ✅       | e.g. `2022`                                               |
| `type`   | string  | ✅       | `"cash"` or `"accrual"` — selects the generation strategy |
| `format` | string  | optional | reserved (routing hint for output format)                 |

Validation source: `src/@modules/infra/validator/zod/invoice/invoice.validation.ts`
(`z.object({ month: z.number().int(), year: z.number().int(), type: z.enum(["cash","accrual"]) })`).

```bash
curl -X POST http://localhost:3000/invoice \
  -H "Content-Type: application/json" \
  -d '{ "month": 1, "year": 2022, "type": "cash" }'
```

### Strategy semantics

| `type`      | Rule (see `domain/strategy/invoice/type/`)                                                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `"cash"`    | One invoice **per payment received** in `{month, year}`; amount = payment amount; date = payment date                                                        |
| `"accrual"` | One invoice **per elapsed period before** `{month, year}`; amount = `contract.amount / contract.periods`; dates via `moment.utc(date).add(period, 'months')` |

### Success — `200 OK`

The presenter wraps the result (`{ data: ... }`):

```json
{
  "data": [{ "date": "2022-01-05T10:00:00.000Z", "amount": 6000 }]
}
```

With the **seeded** database (`migration/create.sql`), `{ "month": 1, "year": 2022, "type": "cash" }` returns exactly the invoice above (one payment on 2022-01-05), while `"accrual"` with `month: 2` returns one invoice of `500` (6000/12) dated 2022-01-01.

### Errors

| Status | Shape                                                                          | When                                                                        |
| ------ | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| `400`  | `{ "status": 400, "error": true, "message": "...", "cause": [zod issues...] }` | `ValidationDataError` from the `@Validate` decorator (invalid `InvoiceDTO`) |
| `500`  | `{ "status": 500, "error": true, "message": "..." }`                           | unexpected failure (DB down, etc.) via `@ErrorHandler`                      |

### Side effect — email

A successful generation emits `invoice_generated` on the internal **Mediator**; `EmailController` consumes it, validates the payload with `ZodEmailSpecification` and sends the invoices through the **EmailRouter**:

- `smtp` engine → `nodemailer` → **MailHog** in dev (`EMAIL_HOST`, `EMAIL_PORT`, compose: SMTP `1025`, UI <http://localhost:8025>)
- `pdf` engine → `puppeteer` (PDF/screenshot rendering path, for formatted invoices)

---

## Postman collection

- Collection: [`postman/collections/Tax-Invoice-Issuer.postman_collection.json`](../../postman/collections/Tax-Invoice-Issuer.postman_collection.json) — 23 requests / 6 folders / 2 environments (local, azure).
- Guide: [`postman/README.md`](../../postman/README.md)

## Swagger / OpenAPI

- `npm run docs:swagger` regenerates `docs/swagger.json` from `swagger.js` (swagger-autogen parsing `src/server.ts`). `paths` is intentionally near-empty because routes are registered dynamically via the adapter — treat this doc + Postman as the source of truth.
- Mounting `swagger-ui-express` on Express 5 currently loops (see note in the endpoints table).

---

[← Architecture](ARCHITECTURE.md) · [Data Model](DATA-MODEL.md) · [Docs Index](../INDEX.md)
