import supertest from "supertest";
import { MODULES } from "../../src/app";
import { INVOICE_GENERATE_VALID_INPUT } from "../@mock/invoice/generate.mock";
import { shutdownDatabase } from "../util/database.util";

describe("[E2E] | HTTP", () => {
  const app = MODULES.INFRA.ENGINE.SERVER.HTTP.EXPRESS._();
  const request = supertest(app);

  afterAll(async () => await shutdownDatabase());

  // ============================================================================
  // ROUTING - Unknown Endpoints
  // ============================================================================

  it("[E2E] | HTTP - Unknown route returns 404", async () => {
    const response = await request.get("/nonexistent");

    expect(response.status).toBe(404);
  });

  it("[E2E] | HTTP - Wrong method on /invoice returns 404", async () => {
    const response = await request.get("/invoice");

    expect(response.status).toBe(404);
  });

  it("[E2E] | HTTP - PUT /invoice returns 404", async () => {
    const response = await request
      .put("/invoice")
      .send(INVOICE_GENERATE_VALID_INPUT);

    expect(response.status).toBe(404);
  });

  it("[E2E] | HTTP - DELETE /invoice returns 404", async () => {
    const response = await request.delete("/invoice");

    expect(response.status).toBe(404);
  });

  // ============================================================================
  // HEADERS - Content-Type Handling
  // ============================================================================

  it("[E2E] | HTTP - Response Content-Type is JSON", async () => {
    const response = await request
      .post("/invoice")
      .send(INVOICE_GENERATE_VALID_INPUT);

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toMatch(/json/);
  });

  it("[E2E] | HTTP - Request without Content-Type header is handled", async () => {
    const response = await request
      .post("/invoice")
      .set("Content-Type", "text/plain")
      .send(JSON.stringify(INVOICE_GENERATE_VALID_INPUT));

    // Should either reject (400/415) or still process
    expect([200, 400, 415, 422]).toContain(response.status);
  });

  // ============================================================================
  // RESPONSE FORMAT - Presenter Output Integrity
  // ============================================================================

  it("[E2E] | HTTP - Response body is parseable (no corruption)", async () => {
    const response = await request
      .post("/invoice")
      .send(INVOICE_GENERATE_VALID_INPUT);

    expect(response.status).toBe(200);

    // Body should be parseable regardless of double-encoding
    let invoices: any;
    if (typeof response.body === "string") {
      expect(() => {
        invoices = JSON.parse(response.body);
      }).not.toThrow();
    } else {
      invoices = response.body;
    }

    expect(Array.isArray(invoices)).toBe(true);
  });

  it("[E2E] | HTTP - Invoice amounts are numeric (not stringified)", async () => {
    const response = await request
      .post("/invoice")
      .send(INVOICE_GENERATE_VALID_INPUT);

    expect(response.status).toBe(200);

    const invoices =
      typeof response.body === "string"
        ? JSON.parse(response.body)
        : response.body;

    if (invoices.length > 0) {
      invoices.forEach((invoice: any) => {
        expect(typeof invoice.amount).toBe("number");
        expect(invoice.amount).toBeGreaterThan(0);
      });
    }
  });

  it("[E2E] | HTTP - Invoice dates are valid ISO strings", async () => {
    const response = await request
      .post("/invoice")
      .send(INVOICE_GENERATE_VALID_INPUT);

    expect(response.status).toBe(200);

    const invoices =
      typeof response.body === "string"
        ? JSON.parse(response.body)
        : response.body;

    if (invoices.length > 0) {
      invoices.forEach((invoice: any) => {
        const date = new Date(invoice.date);
        expect(date.getTime()).not.toBeNaN();
        // ISO format should contain 'T' separator
        expect(invoice.date).toMatch(/\d{4}-\d{2}-\d{2}T/);
      });
    }
  });

  // ============================================================================
  // ERROR RESPONSE - Consistent Error Shape
  // ============================================================================

  it("[E2E] | HTTP - All validation errors have consistent structure", async () => {
    const invalidPayloads = [
      {},
      { month: "abc", year: 2022, type: "cash" },
      { month: 1, year: 2022, type: 123 },
      { month: 1, year: 2022 },
    ];

    for (const payload of invalidPayloads) {
      const response = await request.post("/invoice").send(payload);

      expect(response.status).toBe(400);

      const body =
        typeof response.body === "string"
          ? JSON.parse(response.body)
          : response.body;

      // All errors must have 'error' and 'status' properties
      expect(body).toHaveProperty("error");
      expect(body).toHaveProperty("status");
      expect(body.status).toBe(400);
    }
  });

  // ============================================================================
  // RESILIENCE - Application Stability
  // ============================================================================

  it("[E2E] | HTTP - Application handles rapid sequential requests", async () => {
    const requests = Array.from({ length: 5 }, () =>
      request.post("/invoice").send(INVOICE_GENERATE_VALID_INPUT),
    );

    const responses = await Promise.all(requests);

    responses.forEach((response) => {
      expect(response.status).toBe(200);
    });
  });

  it("[E2E] | HTTP - Large payload does not crash application", async () => {
    const largePayload = {
      month: 1,
      year: 2022,
      type: "cash",
      junk: "x".repeat(50000),
    };

    const response = await request.post("/invoice").send(largePayload);

    // Should not crash (200 = processed, 413 = payload too large)
    expect([200, 400, 413]).toContain(response.status);

    // Verify app still works after large payload
    const healthCheck = await request.get("/");
    expect(healthCheck.status).toBe(200);
  });
});
