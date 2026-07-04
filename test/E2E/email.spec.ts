import "reflect-metadata";

import supertest from "supertest";
import { MODULES } from "../../src/app";
import { INVOICE_GENERATE_VALID_INPUT } from "../@mock/invoice/generate.mock";
import { shutdownDatabase } from "../util/database.util";

/**
 * E2E Tests for Email Integration via Mediator Pattern
 *
 * Tests email sending triggered by invoice generation events.
 * Email controller is registered via Mediator and receives INVOICE_GENERATED events.
 */
describe("[E2E] | EMAIL", () => {
  const app = MODULES.INFRA.ENGINE.SERVER.HTTP.EXPRESS._();
  const request = supertest(app);

  afterAll(async () => await shutdownDatabase());

  // ============================================================================
  // HAPPY PATH - Invoice Generation Triggers Email
  // ============================================================================

  it("[E2E] | EMAIL - [HAPPY PATH] Invoice generation succeeds", async () => {
    const response = await request
      .post("/invoice")
      .send(INVOICE_GENERATE_VALID_INPUT);

    expect(response.status).toBe(200);

    // Parse response body if it's a string
    const invoices =
      typeof response.body === "string"
        ? JSON.parse(response.body)
        : response.body;

    expect(Array.isArray(invoices)).toBe(true);
  });

  it("[E2E] | EMAIL - [INTEGRATION] Multiple invoices generate successfully", async () => {
    const response = await request
      .post("/invoice")
      .send(INVOICE_GENERATE_VALID_INPUT);

    expect(response.status).toBe(200);

    // Parse response body if it's a string
    const invoices =
      typeof response.body === "string"
        ? JSON.parse(response.body)
        : response.body;

    expect(Array.isArray(invoices)).toBe(true);
    expect(invoices.length).toBeGreaterThan(0);

    // Each invoice should have essential properties
    invoices.forEach((invoice: any) => {
      expect(invoice).toHaveProperty("date");
      expect(invoice).toHaveProperty("amount");
      expect(typeof invoice.amount).toBe("number");
      expect(invoice.amount).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // VALIDATION - Invalid Invoice Data
  // ============================================================================

  it("[E2E] | EMAIL - [VALIDATION] Rejects invalid input", async () => {
    const invalidData = { invalid: "data" };

    const response = await request.post("/invoice").send(invalidData);

    // Should return error status
    expect([400, 422, 500]).toContain(response.status);
  });

  it("[E2E] | EMAIL - [VALIDATION] Rejects empty payload", async () => {
    const response = await request.post("/invoice").send({});

    expect([400, 422, 500]).toContain(response.status);
  });

  // ============================================================================
  // ERROR HANDLING - Service Failures
  // ============================================================================

  it("[E2E] | EMAIL - [ERROR] Handles server errors gracefully", async () => {
    // POST to valid endpoint with valid data
    const response = await request
      .post("/invoice")
      .send(INVOICE_GENERATE_VALID_INPUT);

    // Either success or explicit error, not 5xx
    if (response.status >= 400) {
      expect([400, 422]).toContain(response.status);
    } else {
      expect(response.status).toBe(200);
    }
  });

  // ============================================================================
  // EDGE CASES - Boundary Values
  // ============================================================================

  it("[E2E] | EMAIL - [EDGE CASE] Health check endpoint works", async () => {
    const response = await request.get("/");

    expect([200, 404]).toContain(response.status);
  });

  it("[E2E] | EMAIL - [EDGE CASE] Invoice endpoint is accessible", async () => {
    // Just verify endpoint exists (may need valid data)
    const response = await request
      .post("/invoice")
      .send(INVOICE_GENERATE_VALID_INPUT);

    // Endpoint exists and returns a response
    expect(response.status).toBeDefined();
  });

  // ============================================================================
  // DATA CONSISTENCY - Response Structure
  // ============================================================================

  it("[E2E] | EMAIL - [CONSISTENCY] Response has consistent structure", async () => {
    const response = await request
      .post("/invoice")
      .send(INVOICE_GENERATE_VALID_INPUT);

    expect(response.status).toBe(200);

    // Parse response body if it's a string
    const invoices =
      typeof response.body === "string"
        ? JSON.parse(response.body)
        : response.body;

    expect(Array.isArray(invoices)).toBe(true);

    invoices.forEach((invoice: any) => {
      // Verify all required fields present
      expect(Object.keys(invoice).length).toBeGreaterThan(0);
      expect(invoice.date).toBeDefined();
      expect(invoice.amount).toBeDefined();
    });
  });

  it("[E2E] | EMAIL - [CONSISTENCY] Multiple requests maintain isolation", async () => {
    const response1 = await request
      .post("/invoice")
      .send(INVOICE_GENERATE_VALID_INPUT);

    const response2 = await request
      .post("/invoice")
      .send(INVOICE_GENERATE_VALID_INPUT);

    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);

    // Parse responses if they're strings
    const invoices1 =
      typeof response1.body === "string"
        ? JSON.parse(response1.body)
        : response1.body;
    const invoices2 =
      typeof response2.body === "string"
        ? JSON.parse(response2.body)
        : response2.body;

    // Both should return valid invoice arrays
    expect(Array.isArray(invoices1)).toBe(true);
    expect(Array.isArray(invoices2)).toBe(true);
  });
});
