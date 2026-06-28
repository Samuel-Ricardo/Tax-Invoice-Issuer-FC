import supertest from "supertest";
import { MODULES } from "../../src/app";
import {
  INVOICE_GENERATE_VALID_INPUT,
  INVOICE_GENERATE_ACCRUAL_INPUT,
  INVOICE_GENERATE_WITH_FORMAT_INPUT,
  INVOICE_GENERATE_WITH_EXTRA_FIELDS_INPUT,
} from "../@mock/invoice/generate.mock";
import {
  INVOICE_MISSING_MONTH_INPUT,
  INVOICE_MISSING_YEAR_INPUT,
  INVOICE_MISSING_TYPE_INPUT,
  INVOICE_INVALID_TYPE_INPUT,
  INVOICE_UPPERCASE_TYPE_INPUT,
  INVOICE_MONTH_AS_STRING_INPUT,
  INVOICE_YEAR_AS_STRING_INPUT,
  INVOICE_TYPE_AS_NUMBER_INPUT,
  INVOICE_NULL_MONTH_INPUT,
  INVOICE_NULL_YEAR_INPUT,
  INVOICE_NULL_TYPE_INPUT,
  INVOICE_EMPTY_PAYLOAD,
} from "../@mock/invoice/invalid-input.mock";
import {
  INVOICE_MONTH_ZERO_INPUT,
  INVOICE_MONTH_THIRTEEN_INPUT,
  INVOICE_MONTH_NEGATIVE_INPUT,
  INVOICE_YEAR_NEGATIVE_INPUT,
  INVOICE_YEAR_TOO_LARGE_INPUT,
  INVOICE_MONTH_FLOAT_INPUT,
  INVOICE_YEAR_FLOAT_INPUT,
  INVOICE_MONTH_BOUNDARY_MIN_INPUT,
  INVOICE_MONTH_BOUNDARY_MAX_INPUT,
  INVOICE_YEAR_START_OF_DATA_INPUT,
  INVOICE_YEAR_FAR_FUTURE_INPUT,
} from "../@mock/invoice/edge-case-input.mock";
import { shutdownDatabase } from "../util/database.util";

describe("[E2E] | INVOICE", () => {
  afterAll(async () => await shutdownDatabase());

  // ============================================================================
  // HAPPY PATH - Success
  // ============================================================================

  it("[E2E] | GENERATE [INVOICE] - Cash Basis Success", async () => {
    const response = await supertest(
      MODULES.INFRA.ENGINE.SERVER.HTTP.EXPRESS._(),
    )
      .post("/invoice")
      .send(INVOICE_GENERATE_VALID_INPUT);

    expect(response.status).toBe(200);

    const invoices =
      typeof response.body === "string"
        ? JSON.parse(response.body)
        : response.body;

    expect(Array.isArray(invoices)).toBe(true);
    expect(invoices.length).toBeGreaterThan(0);
    expect(invoices[0]).toHaveProperty("date");
    expect(invoices[0]).toHaveProperty("amount");
  });

  it("[E2E] | GENERATE [INVOICE] - Accrual Basis Success", async () => {
    const response = await supertest(
      MODULES.INFRA.ENGINE.SERVER.HTTP.EXPRESS._(),
    )
      .post("/invoice")
      .send(INVOICE_GENERATE_ACCRUAL_INPUT);

    expect(response.status).toBe(200);

    const invoices =
      typeof response.body === "string"
        ? JSON.parse(response.body)
        : response.body;

    expect(Array.isArray(invoices)).toBe(true);
  });

  it("[E2E] | GENERATE [INVOICE] - With Optional Format", async () => {
    const response = await supertest(
      MODULES.INFRA.ENGINE.SERVER.HTTP.EXPRESS._(),
    )
      .post("/invoice")
      .send(INVOICE_GENERATE_WITH_FORMAT_INPUT);

    expect(response.status).toBe(200);

    const invoices =
      typeof response.body === "string"
        ? JSON.parse(response.body)
        : response.body;

    expect(Array.isArray(invoices)).toBe(true);
  });

  // ============================================================================
  // VALIDATION - Required Fields
  // ============================================================================

  it("[E2E] | GENERATE [INVOICE] - Missing Required Field (month)", async () => {
    const response = await supertest(
      MODULES.INFRA.ENGINE.SERVER.HTTP.EXPRESS._(),
    )
      .post("/invoice")
      .send(INVOICE_MISSING_MONTH_INPUT);

    expect(response.status).toBe(400);

    const body =
      typeof response.body === "string"
        ? JSON.parse(response.body)
        : response.body;

    // Zod validation error returns {error, status}
    expect(body).toHaveProperty("error");
    expect(body).toHaveProperty("status");
    expect(body.status).toBe(400);
  });

  it("[E2E] | GENERATE [INVOICE] - Missing Required Field (year)", async () => {
    const response = await supertest(
      MODULES.INFRA.ENGINE.SERVER.HTTP.EXPRESS._(),
    )
      .post("/invoice")
      .send(INVOICE_MISSING_YEAR_INPUT);

    expect(response.status).toBe(400);

    const body =
      typeof response.body === "string"
        ? JSON.parse(response.body)
        : response.body;

    expect(body).toHaveProperty("error");
    expect(body).toHaveProperty("status");
  });

  it("[E2E] | GENERATE [INVOICE] - Missing Required Field (type)", async () => {
    const response = await supertest(
      MODULES.INFRA.ENGINE.SERVER.HTTP.EXPRESS._(),
    )
      .post("/invoice")
      .send(INVOICE_MISSING_TYPE_INPUT);

    expect(response.status).toBe(400);

    const body =
      typeof response.body === "string"
        ? JSON.parse(response.body)
        : response.body;

    expect(body).toHaveProperty("error");
    expect(body).toHaveProperty("status");
  });

  // ============================================================================
  // VALIDAÇÃO - Tipo de Estratégia Inválido
  // ============================================================================

  it("[E2E] | GENERATE [INVOICE] - Invalid Strategy Type (not cash/accrual)", async () => {
    const response = await supertest(
      MODULES.INFRA.ENGINE.SERVER.HTTP.EXPRESS._(),
    )
      .post("/invoice")
      .send(INVOICE_INVALID_TYPE_INPUT);

    expect(response.status).toBe(400);

    const body =
      typeof response.body === "string"
        ? JSON.parse(response.body)
        : response.body;

    expect(body).toHaveProperty("error");
    expect(body).toHaveProperty("status");
  });

  it("[E2E] | GENERATE [INVOICE] - Invalid Strategy Type (uppercase)", async () => {
    const response = await supertest(
      MODULES.INFRA.ENGINE.SERVER.HTTP.EXPRESS._(),
    )
      .post("/invoice")
      .send(INVOICE_UPPERCASE_TYPE_INPUT);

    expect(response.status).toBe(400);

    const body =
      typeof response.body === "string"
        ? JSON.parse(response.body)
        : response.body;

    expect(body).toHaveProperty("error");
  });

  // ============================================================================
  // VALIDAÇÃO - Range de Valores (sem validação de range na spec atual)
  // ============================================================================

  it("[E2E] | GENERATE [INVOICE] - Invalid Month (zero)", async () => {
    const response = await supertest(
      MODULES.INFRA.ENGINE.SERVER.HTTP.EXPRESS._(),
    )
      .post("/invoice")
      .send(INVOICE_MONTH_ZERO_INPUT);

    expect(response.status).toBe(200);
    // Range validation not implemented yet - accepts values outside 1-12
  });

  it("[E2E] | GENERATE [INVOICE] - Invalid Month (13)", async () => {
    const response = await supertest(
      MODULES.INFRA.ENGINE.SERVER.HTTP.EXPRESS._(),
    )
      .post("/invoice")
      .send(INVOICE_MONTH_THIRTEEN_INPUT);

    expect(response.status).toBe(200);
  });

  it("[E2E] | GENERATE [INVOICE] - Invalid Month (negative)", async () => {
    const response = await supertest(
      MODULES.INFRA.ENGINE.SERVER.HTTP.EXPRESS._(),
    )
      .post("/invoice")
      .send(INVOICE_MONTH_NEGATIVE_INPUT);

    expect(response.status).toBe(200);
  });

  it("[E2E] | GENERATE [INVOICE] - Invalid Year (negative)", async () => {
    const response = await supertest(
      MODULES.INFRA.ENGINE.SERVER.HTTP.EXPRESS._(),
    )
      .post("/invoice")
      .send(INVOICE_YEAR_NEGATIVE_INPUT);

    expect(response.status).toBe(200);
  });

  it("[E2E] | GENERATE [INVOICE] - Year Too Large", async () => {
    const response = await supertest(
      MODULES.INFRA.ENGINE.SERVER.HTTP.EXPRESS._(),
    )
      .post("/invoice")
      .send(INVOICE_YEAR_TOO_LARGE_INPUT);

    expect(response.status).toBe(200);
  });

  // ============================================================================
  // VALIDATION - Incorrect Data Types
  // ============================================================================

  it("[E2E] | GENERATE [INVOICE] - Month as String", async () => {
    const response = await supertest(
      MODULES.INFRA.ENGINE.SERVER.HTTP.EXPRESS._(),
    )
      .post("/invoice")
      .send(INVOICE_MONTH_AS_STRING_INPUT);

    expect(response.status).toBe(400);

    const body =
      typeof response.body === "string"
        ? JSON.parse(response.body)
        : response.body;

    expect(body).toHaveProperty("error");
  });

  it("[E2E] | GENERATE [INVOICE] - Year as String", async () => {
    const response = await supertest(
      MODULES.INFRA.ENGINE.SERVER.HTTP.EXPRESS._(),
    )
      .post("/invoice")
      .send(INVOICE_YEAR_AS_STRING_INPUT);

    expect(response.status).toBe(400);

    const body =
      typeof response.body === "string"
        ? JSON.parse(response.body)
        : response.body;

    expect(body).toHaveProperty("error");
  });

  it("[E2E] | GENERATE [INVOICE] - Type as Number", async () => {
    const response = await supertest(
      MODULES.INFRA.ENGINE.SERVER.HTTP.EXPRESS._(),
    )
      .post("/invoice")
      .send(INVOICE_TYPE_AS_NUMBER_INPUT);

    expect(response.status).toBe(400);

    const body =
      typeof response.body === "string"
        ? JSON.parse(response.body)
        : response.body;

    expect(body).toHaveProperty("error");
  });

  // ============================================================================
  // VALIDATION - Null and Undefined Values
  // ============================================================================

  it("[E2E] | GENERATE [INVOICE] - Month is Null", async () => {
    const response = await supertest(
      MODULES.INFRA.ENGINE.SERVER.HTTP.EXPRESS._(),
    )
      .post("/invoice")
      .send(INVOICE_NULL_MONTH_INPUT);

    expect(response.status).toBe(400);

    const body =
      typeof response.body === "string"
        ? JSON.parse(response.body)
        : response.body;

    expect(body).toHaveProperty("error");
  });

  it("[E2E] | GENERATE [INVOICE] - Year is Null", async () => {
    const response = await supertest(
      MODULES.INFRA.ENGINE.SERVER.HTTP.EXPRESS._(),
    )
      .post("/invoice")
      .send(INVOICE_NULL_YEAR_INPUT);

    expect(response.status).toBe(400);

    const body =
      typeof response.body === "string"
        ? JSON.parse(response.body)
        : response.body;

    expect(body).toHaveProperty("error");
  });

  it("[E2E] | GENERATE [INVOICE] - Type is Null", async () => {
    const response = await supertest(
      MODULES.INFRA.ENGINE.SERVER.HTTP.EXPRESS._(),
    )
      .post("/invoice")
      .send(INVOICE_NULL_TYPE_INPUT);

    expect(response.status).toBe(400);

    const body =
      typeof response.body === "string"
        ? JSON.parse(response.body)
        : response.body;

    expect(body).toHaveProperty("error");
  });

  // ============================================================================
  // VALIDATION - Empty Payload
  // ============================================================================

  it("[E2E] | GENERATE [INVOICE] - Empty Payload", async () => {
    const response = await supertest(
      MODULES.INFRA.ENGINE.SERVER.HTTP.EXPRESS._(),
    )
      .post("/invoice")
      .send(INVOICE_EMPTY_PAYLOAD);

    expect(response.status).toBe(400);

    const body =
      typeof response.body === "string"
        ? JSON.parse(response.body)
        : response.body;

    expect(body).toHaveProperty("error");
  });

  // ============================================================================
  // VALIDATION - Extra Fields (should be ignored)
  // ============================================================================

  it("[E2E] | GENERATE [INVOICE] - Extra Fields Ignored", async () => {
    const response = await supertest(
      MODULES.INFRA.ENGINE.SERVER.HTTP.EXPRESS._(),
    )
      .post("/invoice")
      .send(INVOICE_GENERATE_WITH_EXTRA_FIELDS_INPUT);

    expect(response.status).toBe(200);

    const invoices =
      typeof response.body === "string"
        ? JSON.parse(response.body)
        : response.body;

    // Deve processar normalmente ignorando extras
    expect(Array.isArray(invoices)).toBe(true);
  });

  // ============================================================================
  // VALIDAÇÃO - Float em Campos de Number
  // ============================================================================

  it("[E2E] | GENERATE [INVOICE] - Month as Float", async () => {
    const response = await supertest(
      MODULES.INFRA.ENGINE.SERVER.HTTP.EXPRESS._(),
    )
      .post("/invoice")
      .send(INVOICE_MONTH_FLOAT_INPUT);

    expect(response.status).toBe(200);
    // Float values may be accepted depending on validation rules
  });

  it("[E2E] | GENERATE [INVOICE] - Year as Float", async () => {
    const response = await supertest(
      MODULES.INFRA.ENGINE.SERVER.HTTP.EXPRESS._(),
    )
      .post("/invoice")
      .send(INVOICE_YEAR_FLOAT_INPUT);

    expect(response.status).toBe(200);
  });

  // ============================================================================
  // VALIDATION - Boundary Cases
  // ============================================================================

  it("[E2E] | GENERATE [INVOICE] - Month Boundary (1)", async () => {
    const response = await supertest(
      MODULES.INFRA.ENGINE.SERVER.HTTP.EXPRESS._(),
    )
      .post("/invoice")
      .send(INVOICE_MONTH_BOUNDARY_MIN_INPUT);

    expect(response.status).toBe(200);
  });

  it("[E2E] | GENERATE [INVOICE] - Month Boundary (12)", async () => {
    const response = await supertest(
      MODULES.INFRA.ENGINE.SERVER.HTTP.EXPRESS._(),
    )
      .post("/invoice")
      .send(INVOICE_MONTH_BOUNDARY_MAX_INPUT);

    expect(response.status).toBe(200);
  });

  it("[E2E] | GENERATE [INVOICE] - Year Start of Data (2022)", async () => {
    const response = await supertest(
      MODULES.INFRA.ENGINE.SERVER.HTTP.EXPRESS._(),
    )
      .post("/invoice")
      .send(INVOICE_YEAR_START_OF_DATA_INPUT);

    expect(response.status).toBe(200);
  });

  it("[E2E] | GENERATE [INVOICE] - Year Far Future", async () => {
    const response = await supertest(
      MODULES.INFRA.ENGINE.SERVER.HTTP.EXPRESS._(),
    )
      .post("/invoice")
      .send(INVOICE_YEAR_FAR_FUTURE_INPUT);

    expect(response.status).toBe(200);
    // May not have data but should not crash
  });
});
