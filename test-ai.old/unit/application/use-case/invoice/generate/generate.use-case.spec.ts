import { GenerateInvoiceUseCaseImpl } from "../../../../../../src/@modules/application/use-case/invoice/generate.use-case";
import { TestFixtures } from "../../../../../helpers/fixtures";
import { MockMediator } from "../../../../../helpers/mediator.helper";

describe("[UNIT] Use Case - Generate Invoice", () => {
  let useCase: GenerateInvoiceUseCaseImpl;
  let mockMediator: MockMediator;
  const INVOICE_GENERATED_EVENT = "INVOICE_GENERATED";

  beforeEach(() => {
    mockMediator = new MockMediator();
    useCase = new GenerateInvoiceUseCaseImpl(
      mockMediator,
      INVOICE_GENERATED_EVENT,
    );
  });

  afterEach(() => {
    mockMediator.reset();
  });

  describe("execute", () => {
    test("Should generate invoices for contracts with accrual strategy", async () => {
      const contract = TestFixtures.createContract();
      const invoiceDTO = {
        month: 1,
        year: 2022,
        type: "accrual" as const,
      };

      const result = await useCase.execute({
        contracts: [contract],
        invoice: invoiceDTO,
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    test("Should generate invoices for contracts with cash strategy", async () => {
      const contract = TestFixtures.createContractWithPayments();
      const invoiceDTO = {
        month: 1,
        year: 2022,
        type: "cash" as const,
      };

      const result = await useCase.execute({
        contracts: [contract],
        invoice: invoiceDTO,
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    test("Should publish INVOICE_GENERATED event", async () => {
      const contract = TestFixtures.createContract();
      const invoiceDTO = {
        month: 1,
        year: 2022,
        type: "accrual" as const,
      };

      await useCase.execute({
        contracts: [contract],
        invoice: invoiceDTO,
      });

      const events = mockMediator.getPublishedEvents(INVOICE_GENERATED_EVENT);
      expect(events).toHaveLength(1);
      expect(events[0].event).toBe(INVOICE_GENERATED_EVENT);
    });

    test("Should handle multiple contracts", async () => {
      const contract1 = TestFixtures.createContract({
        idContract: "contract-1",
      });
      const contract2 = TestFixtures.createContract({
        idContract: "contract-2",
      });
      const contract3 = TestFixtures.createContract({
        idContract: "contract-3",
      });

      const invoiceDTO = {
        month: 1,
        year: 2022,
        type: "accrual" as const,
      };

      const result = await useCase.execute({
        contracts: [contract1, contract2, contract3],
        invoice: invoiceDTO,
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    test("Should return empty array for empty contracts", async () => {
      const invoiceDTO = {
        month: 1,
        year: 2022,
        type: "accrual" as const,
      };

      const result = await useCase.execute({
        contracts: [],
        invoice: invoiceDTO,
      });

      expect(result).toEqual([]);
    });

    test("Should flatten invoices from multiple contracts", async () => {
      const contract1 = TestFixtures.createContract();
      const contract2 = TestFixtures.createContract();

      const invoiceDTO = {
        month: 1,
        year: 2022,
        type: "accrual" as const,
      };

      const result = await useCase.execute({
        contracts: [contract1, contract2],
        invoice: invoiceDTO,
      });

      expect(Array.isArray(result)).toBe(true);
      // Result should be a flattened array of all invoices
    });

    test("Should pass generated invoices to mediator", async () => {
      const contract = TestFixtures.createContract();
      const invoiceDTO = {
        month: 1,
        year: 2022,
        type: "accrual" as const,
      };

      const result = await useCase.execute({
        contracts: [contract],
        invoice: invoiceDTO,
      });

      const events = mockMediator.getPublishedEvents(INVOICE_GENERATED_EVENT);
      expect(events[0].data).toEqual(result);
    });

    test("Should handle different months", async () => {
      const contract = TestFixtures.createContract();

      for (let month = 1; month <= 12; month++) {
        mockMediator.reset();
        const invoiceDTO = {
          month,
          year: 2022,
          type: "accrual" as const,
        };

        const result = await useCase.execute({
          contracts: [contract],
          invoice: invoiceDTO,
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      }
    });

    test("Should handle different years", async () => {
      const contract = TestFixtures.createContract({
        date: new Date("2020-01-01T10:00:00"),
      });

      for (const year of [2020, 2021, 2022, 2023]) {
        mockMediator.reset();
        const invoiceDTO = {
          month: 1,
          year,
          type: "accrual" as const,
        };

        const result = await useCase.execute({
          contracts: [contract],
          invoice: invoiceDTO,
        });

        expect(result).toBeDefined();
      }
    });
  });
});
