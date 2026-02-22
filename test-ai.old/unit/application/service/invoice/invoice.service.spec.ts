import { InvoiceServiceImpl } from "../../../../../src/@modules/application/service/invoice/invoice.service";
import { ListContractUseCase } from "../../../../../src/@modules/domain/use-case/contract/list.use-case";
import { GenerateInvoiceUseCase } from "../../../../../src/@modules/domain/use-case/invoice/generate.use-case";
import { TestFixtures } from "../../../../helpers/fixtures";

describe("[UNIT] Service - Invoice", () => {
  let service: InvoiceServiceImpl;
  let mockGenerateInvoiceUseCase: jest.Mocked<GenerateInvoiceUseCase>;
  let mockListContractUseCase: jest.Mocked<ListContractUseCase>;

  beforeEach(() => {
    mockGenerateInvoiceUseCase = {
      execute: jest.fn(),
    } as any;

    mockListContractUseCase = {
      execute: jest.fn(),
    } as any;

    service = new InvoiceServiceImpl(
      mockGenerateInvoiceUseCase,
      mockListContractUseCase,
    );
  });

  describe("generate", () => {
    test("Should generate invoices successfully", async () => {
      const contract = TestFixtures.createContract();
      const invoice = TestFixtures.createInvoice();

      mockListContractUseCase.execute.mockResolvedValue([contract]);
      mockGenerateInvoiceUseCase.execute.mockResolvedValue([invoice]);

      const invoiceDTO = {
        month: 1,
        year: 2022,
        type: "accrual" as const,
      };

      const result = await service.generate(invoiceDTO);

      expect(result).toEqual([invoice]);
    });

    test("Should call listContract use case", async () => {
      const contract = TestFixtures.createContract();
      mockListContractUseCase.execute.mockResolvedValue([contract]);
      mockGenerateInvoiceUseCase.execute.mockResolvedValue([]);

      const invoiceDTO = {
        month: 1,
        year: 2022,
        type: "accrual" as const,
      };

      await service.generate(invoiceDTO);

      expect(mockListContractUseCase.execute).toHaveBeenCalledTimes(1);
    });

    test("Should call generateInvoice use case with contracts", async () => {
      const contracts = [
        TestFixtures.createContract(),
        TestFixtures.createContract(),
      ];

      mockListContractUseCase.execute.mockResolvedValue(contracts);
      mockGenerateInvoiceUseCase.execute.mockResolvedValue([]);

      const invoiceDTO = {
        month: 1,
        year: 2022,
        type: "cash" as const,
      };

      await service.generate(invoiceDTO);

      expect(mockGenerateInvoiceUseCase.execute).toHaveBeenCalledWith({
        contracts,
        invoice: invoiceDTO,
      });
    });

    test("Should handle empty contract list", async () => {
      mockListContractUseCase.execute.mockResolvedValue([]);
      mockGenerateInvoiceUseCase.execute.mockResolvedValue([]);

      const invoiceDTO = {
        month: 1,
        year: 2022,
        type: "accrual" as const,
      };

      const result = await service.generate(invoiceDTO);

      expect(result).toEqual([]);
    });

    test("Should handle different invoice types", async () => {
      const contract = TestFixtures.createContractWithPayments();
      const invoice = TestFixtures.createInvoice();

      mockListContractUseCase.execute.mockResolvedValue([contract]);
      mockGenerateInvoiceUseCase.execute.mockResolvedValue([invoice]);

      const invoiceDTO = {
        month: 1,
        year: 2022,
        type: "cash" as const,
      };

      const result = await service.generate(invoiceDTO);

      expect(result).toBeDefined();
    });

    test("Should propagate errors from listContract", async () => {
      mockListContractUseCase.execute.mockRejectedValue(
        new Error("Repository error"),
      );

      const invoiceDTO = {
        month: 1,
        year: 2022,
        type: "accrual" as const,
      };

      await expect(service.generate(invoiceDTO)).rejects.toThrow(
        "Repository error",
      );
    });

    test("Should propagate errors from generateInvoice", async () => {
      mockListContractUseCase.execute.mockResolvedValue([
        TestFixtures.createContract(),
      ]);
      mockGenerateInvoiceUseCase.execute.mockRejectedValue(
        new Error("Generation error"),
      );

      const invoiceDTO = {
        month: 1,
        year: 2022,
        type: "accrual" as const,
      };

      await expect(service.generate(invoiceDTO)).rejects.toThrow(
        "Generation error",
      );
    });
  });
});
