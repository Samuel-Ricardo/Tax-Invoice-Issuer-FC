import { NativeSendInvoiceEmailUseCase } from "../../../../../../../src/@modules/application/use-case/email/send/invoice.use-case";
import { TestFixtures } from "../../../../../../helpers/fixtures";

describe("[UNIT] Use Case - Send Invoice Email", () => {
  let useCase: NativeSendInvoiceEmailUseCase;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    useCase = new NativeSendInvoiceEmailUseCase();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe("execute", () => {
    test("Should execute without errors", async () => {
      const invoices = [TestFixtures.createInvoice()];

      await expect(useCase.execute(invoices)).resolves.not.toThrow();
    });

    test("Should log sending mail", async () => {
      const invoices = [TestFixtures.createInvoice()];

      await useCase.execute(invoices);

      expect(consoleLogSpy).toHaveBeenCalledWith("Sending Mail", {
        invoices,
      });
    });

    test("Should handle multiple invoices", async () => {
      const invoices = [
        TestFixtures.createInvoice(),
        TestFixtures.createInvoice(),
        TestFixtures.createInvoice(),
      ];

      await expect(useCase.execute(invoices)).resolves.not.toThrow();
    });

    test("Should handle empty invoice array", async () => {
      await expect(useCase.execute([])).resolves.not.toThrow();
    });

    test("Should be callable multiple times", async () => {
      const invoices = [TestFixtures.createInvoice()];

      await useCase.execute(invoices);
      await useCase.execute(invoices);
      await useCase.execute(invoices);

      expect(consoleLogSpy).toHaveBeenCalledTimes(3);
    });
  });
});
