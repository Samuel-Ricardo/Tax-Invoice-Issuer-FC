import { JsonPresenter } from "../../../src/@modules/infra/presenter/json/json.presenter";
import { Invoice } from "../../../src/@modules/domain/entity/invoice.entity";

describe("[JSON] - [PRESENTER]", () => {
  let presenter: JsonPresenter;

  beforeEach(() => {
    presenter = new JsonPresenter();
  });

  // ============================================================================
  // HAPPY PATH
  // ============================================================================

  it("[UNIT] | [JSON] - [PRESENTER] > returns invoice array unchanged", async () => {
    const invoices = [new Invoice(new Date("2026-06-01"), 5000)];

    const result = await (presenter as any).present(invoices);

    expect(result).toBe(invoices);
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].amount).toBe(5000);
  });

  it("[UNIT] | [JSON] - [PRESENTER] > returns empty array unchanged", async () => {
    const invoices: Invoice[] = [];
    const result = await (presenter as any).present(invoices);

    expect(result).toBe(invoices);
    expect(result).toEqual([]);
  });

  it("[UNIT] | [JSON] - [PRESENTER] > preserves structured invoice data", async () => {
    const invoices = [
      new Invoice(new Date("2026-06-01"), 1000),
      new Invoice(new Date("2026-06-15"), 2000),
    ];

    const result = await (presenter as any).present(invoices);

    expect(result).toBe(invoices);
    expect(result).toHaveLength(2);
  });

  it("[UNIT] | [JSON] - [PRESENTER] > preserves date and amount properties", async () => {
    const date = new Date("2026-06-01T00:00:00.000Z");
    const invoices = [new Invoice(date, 9999)];

    const result = await (presenter as any).present(invoices);

    expect(result[0]).toHaveProperty("date");
    expect(result[0]).toHaveProperty("amount");
    expect(result[0].amount).toBe(9999);
  });
});
