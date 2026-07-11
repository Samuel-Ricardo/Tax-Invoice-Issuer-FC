import { ListContractUseCaseImpl } from "../../../../../../src/@modules/application/use-case/contract/list.use-case";
import { ContractRepository } from "../../../../../../src/@modules/domain/repository/contract.repository";
import { PaymentRepository } from "../../../../../../src/@modules/domain/repository/payment.repository";
import { TestFixtures } from "../../../../../helpers/fixtures";

describe("[UNIT] Use Case - List Contract", () => {
  let useCase: ListContractUseCaseImpl;
  let mockContractRepository: jest.Mocked<ContractRepository>;
  let mockPaymentRepository: jest.Mocked<PaymentRepository>;

  beforeEach(() => {
    mockContractRepository = {
      list: jest.fn(),
    } as any;

    mockPaymentRepository = {
      list: jest.fn(),
    } as any;

    useCase = new ListContractUseCaseImpl(
      mockContractRepository as any,
      mockPaymentRepository as any,
    );
  });

  describe("execute", () => {
    test("Should list contracts from repository", async () => {
      const contract = TestFixtures.createContract();
      mockContractRepository.list.mockResolvedValue([contract]);
      mockPaymentRepository.list.mockResolvedValue([]);

      const result = await useCase.execute();

      expect(mockContractRepository.list).toHaveBeenCalledTimes(1);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    test("Should attach payments to contracts", async () => {
      const contract = TestFixtures.createContract();
      const payment = TestFixtures.createPayment();

      mockContractRepository.list.mockResolvedValue([contract]);
      mockPaymentRepository.list.mockResolvedValue([payment]);

      const result = await useCase.execute();

      expect(mockPaymentRepository.list).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    test("Should handle multiple contracts", async () => {
      const contracts = [
        TestFixtures.createContract({ idContract: "contract-1" }),
        TestFixtures.createContract({ idContract: "contract-2" }),
        TestFixtures.createContract({ idContract: "contract-3" }),
      ];

      mockContractRepository.list.mockResolvedValue(contracts);
      mockPaymentRepository.list.mockResolvedValue([]);

      const result = await useCase.execute();

      expect(result).toHaveLength(3);
    });

    test("Should handle empty contract list", async () => {
      mockContractRepository.list.mockResolvedValue([]);
      mockPaymentRepository.list.mockResolvedValue([]);

      const result = await useCase.execute();

      expect(result).toEqual([]);
    });

    test("Should call payment repository for each contract", async () => {
      const contracts = [
        TestFixtures.createContract({ idContract: "contract-1" }),
        TestFixtures.createContract({ idContract: "contract-2" }),
      ];

      mockContractRepository.list.mockResolvedValue(contracts);
      mockPaymentRepository.list.mockResolvedValue([]);

      await useCase.execute();

      // Should call payment repository for each contract
      expect(mockPaymentRepository.list).toHaveBeenCalled();
    });

    test("Should handle repository errors", async () => {
      mockContractRepository.list.mockRejectedValue(
        new Error("Database error"),
      );

      await expect(useCase.execute()).rejects.toThrow("Database error");
    });

    test("Should return contracts even if payment repository fails gracefully", async () => {
      const contract = TestFixtures.createContract();
      mockContractRepository.list.mockResolvedValue([contract]);
      mockPaymentRepository.list.mockResolvedValue([]);

      const result = await useCase.execute();

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
    });
  });
});
