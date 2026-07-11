import CsvPresenter from "../../../src/@modules/infra/presenter/csv/csv.presenter";
import { Invoice } from "../../../src/@modules/domain/entity/invoice.entity";
import moment from "moment";

describe("[CSV] - [PRESENTER]", () => {
  let presenter: CsvPresenter;

  beforeEach(() => {
    presenter = new CsvPresenter();
  });

  // ============================================================================
  // HAPPY PATH
  // ============================================================================

  it("[UNIT] | [CSV] - [PRESENTER] > formats single invoice to CSV row", async () => {
    // Use local date constructor to avoid timezone off-by-one
    const date = new Date(2026, 5, 15); // June 15, 2026 (local)
    const invoices = [new Invoice(date, 5000)];

    const result = await (presenter as any).present(invoices);
    const expectedDate = moment(date).format("YYYY-MM-DD");

    expect(typeof result).toBe("string");
    expect(result).toContain(expectedDate);
    expect(result).toContain("5000");
  });

  it("[UNIT] | [CSV] - [PRESENTER] > uses semicolon as delimiter", async () => {
    const invoices = [new Invoice(new Date(2026, 5, 15), 5000)];

    const result = await (presenter as any).present(invoices);

    expect(result).toContain(";");
  });

  it("[UNIT] | [CSV] - [PRESENTER] > formats multiple invoices with newline separator", async () => {
    const invoices = [
      new Invoice(new Date(2026, 5, 1), 1000),
      new Invoice(new Date(2026, 5, 15), 2000),
    ];

    const result = await (presenter as any).present(invoices);

    const rows = result.split("\n");
    expect(rows.length).toBe(2);
  });

  it("[UNIT] | [CSV] - [PRESENTER] > each row has date and amount", async () => {
    const date1 = new Date(2026, 0, 1); // Jan 1
    const date2 = new Date(2026, 5, 15); // Jun 15
    const invoices = [new Invoice(date1, 3500), new Invoice(date2, 7200)];

    const result = await (presenter as any).present(invoices);

    expect(result).toContain(moment(date1).format("YYYY-MM-DD"));
    expect(result).toContain("3500");
    expect(result).toContain(moment(date2).format("YYYY-MM-DD"));
    expect(result).toContain("7200");
  });

  // ============================================================================
  // EDGE CASES
  // ============================================================================

  it("[UNIT] | [CSV] - [PRESENTER] > returns empty string for empty array", async () => {
    const result = await (presenter as any).present([]);

    expect(result).toBe("");
  });

  it("[UNIT] | [CSV] - [PRESENTER] > formats date in YYYY-MM-DD format", async () => {
    const date = new Date(2026, 11, 31); // Dec 31, 2026 (local)
    const invoices = [new Invoice(date, 100)];

    const result = await (presenter as any).present(invoices);
    const expectedDate = moment(date).format("YYYY-MM-DD");

    expect(result).toMatch(new RegExp(expectedDate));
  });
});
