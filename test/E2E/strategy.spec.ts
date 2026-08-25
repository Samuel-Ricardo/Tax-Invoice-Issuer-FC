import supertest from "supertest";
import { MODULES } from "../../src/app";
import {
  INVOICE_GENERATE_VALID_INPUT,
  INVOICE_GENERATE_ACCRUAL_INPUT,
} from "../@mock/invoice/generate.mock";
import { shutdownDatabase } from "../util/database.util";

describe("[E2E] | STRATEGY", () => {
  const app = MODULES.INFRA.ENGINE.SERVER.HTTP.EXPRESS._();
  const request = supertest(app);

  afterAll(async () => await shutdownDatabase());

  // ============================================================================
  // STRATEGY COMPARISON - Cash vs Accrual produce different results
  // ============================================================================

  it("[E2E] | STRATEGY - Cash and Accrual produce different results for same period", async () => {
    const cashPayload = { month: 1, year: 2022, type: "cash" };
    const accrualPayload = { month: 1, year: 2022, type: "accrual" };

    const cashResponse = await request.post("/invoice").send(cashPayload);
    const accrualResponse = await request.post("/invoice").send(accrualPayload);

    expect(cashResponse.status).toBe(200);
    expect(accrualResponse.status).toBe(200);

    const cashInvoices = cashResponse.body;
    const accrualInvoices = accrualResponse.body;

    expect(Array.isArray(cashInvoices)).toBe(true);
    expect(Array.isArray(accrualInvoices)).toBe(true);

    // Strategies must produce different outputs (different calculation logic)
    expect(JSON.stringify(cashInvoices)).not.toBe(
      JSON.stringify(accrualInvoices),
    );
  });

  it("[E2E] | STRATEGY - Cash Basis returns valid invoice structure", async () => {
    const response = await request
      .post("/invoice")
      .send(INVOICE_GENERATE_VALID_INPUT);

    expect(response.status).toBe(200);

    const invoices = response.body;

    expect(Array.isArray(invoices)).toBe(true);

    if (invoices.length > 0) {
      invoices.forEach((invoice: any) => {
        expect(invoice).toHaveProperty("date");
        expect(invoice).toHaveProperty("amount");
        expect(typeof invoice.amount).toBe("number");
        expect(typeof invoice.date).toBe("string");
        expect(new Date(invoice.date).getTime()).not.toBeNaN();
      });
    }
  });

  it("[E2E] | STRATEGY - Accrual Basis returns valid invoice structure", async () => {
    const response = await request
      .post("/invoice")
      .send(INVOICE_GENERATE_ACCRUAL_INPUT);

    expect(response.status).toBe(200);

    const invoices = response.body;

    expect(Array.isArray(invoices)).toBe(true);

    if (invoices.length > 0) {
      invoices.forEach((invoice: any) => {
        expect(invoice).toHaveProperty("date");
        expect(invoice).toHaveProperty("amount");
        expect(typeof invoice.amount).toBe("number");
        expect(invoice.amount).toBeGreaterThan(0);
        expect(typeof invoice.date).toBe("string");
        expect(new Date(invoice.date).getTime()).not.toBeNaN();
      });
    }
  });

  it("[E2E] | STRATEGY - Same strategy with same input is idempotent", async () => {
    const response1 = await request
      .post("/invoice")
      .send(INVOICE_GENERATE_VALID_INPUT);

    const response2 = await request
      .post("/invoice")
      .send(INVOICE_GENERATE_VALID_INPUT);

    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);

    const invoices1 = response1.body;
    const invoices2 = response2.body;

    // Identical input must produce identical output
    expect(JSON.stringify(invoices1)).toBe(JSON.stringify(invoices2));
  });

  it("[E2E] | STRATEGY - Sequential different strategies maintain isolation", async () => {
    // Cash → Accrual → Cash again
    const cash1 = await request
      .post("/invoice")
      .send(INVOICE_GENERATE_VALID_INPUT);

    await request.post("/invoice").send(INVOICE_GENERATE_ACCRUAL_INPUT);

    const cash2 = await request
      .post("/invoice")
      .send(INVOICE_GENERATE_VALID_INPUT);

    const invoices1 = cash1.body;
    const invoices2 = cash2.body;

    // First and third (same input) should be identical
    expect(JSON.stringify(invoices1)).toBe(JSON.stringify(invoices2));
  });
});
