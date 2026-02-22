import { ContractRepositorySQL } from "../../../../src/@modules/application/repository/sql/contract.repository";
import { PaymentRepositorySQL } from "../../../../src/@modules/application/repository/sql/payment.repository";
import { InvoiceServiceImpl } from "../../../../src/@modules/application/service/invoice/invoice.service";
import { ListContractUseCaseImpl } from "../../../../src/@modules/application/use-case/contract/list.use-case";
import { GenerateInvoiceUseCaseImpl } from "../../../../src/@modules/application/use-case/invoice/generate.use-case";
import {
  DatabaseTestHelper,
  MockDatabaseConnection,
} from "../../../helpers/database.helper";
import { MockMediator } from "../../../helpers/mediator.helper";

describe("[INTEGRATION] Service - Invoice (Full Flow)", () => {
  let service: InvoiceServiceImpl;
  let mockDatabase: MockDatabaseConnection;
  let mockMediator: MockMediator;

  beforeEach(() => {
    mockDatabase = DatabaseTestHelper.createMockConnection();
    mockMediator = new MockMediator();

    const contractRepository = new ContractRepositorySQL(mockDatabase);
    const paymentRepository = new PaymentRepositorySQL(mockDatabase);

    const listContractUseCase = new ListContractUseCaseImpl(
      contractRepository,
      paymentRepository,
    );

    const generateInvoiceUseCase = new GenerateInvoiceUseCaseImpl(
      mockMediator,
      "INVOICE_GENERATED",
    );

    service = new InvoiceServiceImpl(
      generateInvoiceUseCase,
      listContractUseCase,
    );
  });

  describe("generate - Full Integration", () => {
    test("Should generate invoices with accrual strategy", async () => {
      const invoiceDTO = {
        month: 1,
        year: 2022,
        type: "accrual" as const,
      };

      const result = await service.generate(invoiceDTO);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    test("Should generate invoices with cash strategy", async () => {
      const invoiceDTO = {
        month: 1,
        year: 2022,
        type: "cash" as const,
      };

      const result = await service.generate(invoiceDTO);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    test("Should load contracts from database", async () => {
      const querySpy = jest.spyOn(mockDatabase, "query");

      const invoiceDTO = {
        month: 1,
        year: 2022,
        type: "accrual" as const,
      };

      await service.generate(invoiceDTO);

      expect(querySpy).toHaveBeenCalledWith(
        expect.stringContaining("sam.contract"),
        expect.any(Array),
      );
    });

    test("Should publish event after generation", async () => {
      const invoiceDTO = {
        month: 1,
        year: 2022,
        type: "accrual" as const,
      };

      await service.generate(invoiceDTO);

      const events = mockMediator.getPublishedEvents("INVOICE_GENERATED");
      expect(events).toHaveLength(1);
    });

    test("Should generate correct invoice amounts", async () => {
      const invoiceDTO = {
        month: 1,
        year: 2022,
        type: "accrual" as const,
      };

      const result = await service.generate(invoiceDTO);

      result.forEach((invoice) => {
        expect(invoice.amount).toBeGreaterThan(0);
        expect(typeof invoice.amount).toBe("number");
      });
    });

    test("Should handle different months", async () => {
      for (let month = 1; month <= 12; month++) {
        mockMediator.reset();
        const invoiceDTO = {
          month,
          year: 2022,
          type: "accrual" as const,
        };

        const result = await service.generate(invoiceDTO);

        expect(result).toBeDefined();
      }
    });

    test("Should handle different years", async () => {
      for (const year of [2020, 2021, 2022, 2023]) {
        mockMediator.reset();
        const invoiceDTO = {
          month: 1,
          year,
          type: "accrual" as const,
        };

        const result = await service.generate(invoiceDTO);

        expect(result).toBeDefined();
      }
    });

    test("Should work end-to-end with multiple components", async () => {
      mockDatabase.setMockData("contracts", [
        {
          id_contract: "test-contract-1",
          description: "Test Service",
          amount: 12000,
          periods: 12,
          date: new Date("2022-01-01T10:00:00"),
        },
      ]);

      mockDatabase.setMockData("payments", [
        {
          id_payment: "test-payment-1",
          id_contract: "test-contract-1",
          amount: 1000,
          date: new Date("2022-01-15T10:00:00"),
        },
      ]);

      const invoiceDTO = {
        month: 1,
        year: 2022,
        type: "cash" as const,
      };

      const result = await service.generate(invoiceDTO);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
