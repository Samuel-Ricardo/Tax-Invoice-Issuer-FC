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

  it("[UNIT] | [JSON] - [PRESENTER] > serializes invoice array to JSON string", async () => {
    const invoices = [new Invoice(new Date("2026-06-01"), 5000)];

    const result = await (presenter as any).present(invoices);

    expect(typeof result).toBe("string");
    const parsed = JSON.parse(result);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0].amount).toBe(5000);
  });

  it("[UNIT] | [JSON] - [PRESENTER] > serializes empty array", async () => {
    const result = await (presenter as any).present([]);

    expect(result).toBe("[]");
  });

  it("[UNIT] | [JSON] - [PRESENTER] > produces parseable JSON", async () => {
    const invoices = [
      new Invoice(new Date("2026-06-01"), 1000),
      new Invoice(new Date("2026-06-15"), 2000),
    ];

    const result = await (presenter as any).present(invoices);

    expect(() => JSON.parse(result)).not.toThrow();
    expect(JSON.parse(result)).toHaveLength(2);
  });

  it("[UNIT] | [JSON] - [PRESENTER] > preserves date and amount properties", async () => {
    const date = new Date("2026-06-01T00:00:00.000Z");
    const invoices = [new Invoice(date, 9999)];

    const result = await (presenter as any).present(invoices);
    const parsed = JSON.parse(result);

    expect(parsed[0]).toHaveProperty("date");
    expect(parsed[0]).toHaveProperty("amount");
    expect(parsed[0].amount).toBe(9999);
  });
});
