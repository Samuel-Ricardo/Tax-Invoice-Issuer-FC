import "reflect-metadata";
import { NativeSendInvoiceEmailUseCase } from "../../../../src/@modules/application/use-case/email/send/invoice.use-case";
import { Invoice } from "../../../../src/@modules/domain/entity/invoice.entity";

describe("[USE-CASE] - [EMAIL] - [SEND INVOICE]", () => {
  let useCase: NativeSendInvoiceEmailUseCase;

  beforeEach(() => {
    useCase = new NativeSendInvoiceEmailUseCase();
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("[UNIT] | [USE-CASE] - execute > completes without throwing for non-empty invoices", async () => {
    const invoices = [
      new Invoice(new Date("2022-01-15"), 1000),
      new Invoice(new Date("2022-02-15"), 2000),
    ];

    await expect(useCase.execute(invoices)).resolves.toBeUndefined();
  });

  it("[UNIT] | [USE-CASE] - execute > completes without throwing for empty invoices array", async () => {
    await expect(useCase.execute([])).resolves.toBeUndefined();
  });

  it("[UNIT] | [USE-CASE] - execute > logs the invoices being sent", async () => {
    const invoices = [new Invoice(new Date("2022-01-15"), 1000)];

    await useCase.execute(invoices);

    expect(console.log).toHaveBeenCalledWith("Sending Mail", { invoices });
  });

  it("[UNIT] | [USE-CASE] - execute > returns void (undefined)", async () => {
    const result = await useCase.execute([]);
    expect(result).toBeUndefined();
  });
});
