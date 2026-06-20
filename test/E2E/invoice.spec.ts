import supertest from "supertest";
import { MODULES } from "../../src/app";
import { INVOICE_GENERATE_VALID_INPUT } from "../@mock/invoice/generate.mock";
import { shutdownDatabase } from "../util/database.util";

describe("[E2E] | INVOICE", () => {
  afterAll(async () => await shutdownDatabase());

  it("[E2E] | GENERATE [INVOICE]", async () => {
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
});
