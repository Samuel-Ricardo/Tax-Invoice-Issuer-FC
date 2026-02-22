import { PaymentRepositorySQL } from "../../../../src/@modules/application/repository/sql/payment.repository";
import { DatabaseTestHelper } from "../../../helpers/database.helper";

describe("[INTEGRATION] Repository - Payment SQL", () => {
  let repository: PaymentRepositorySQL;
  let mockDatabase: any;

  beforeEach(() => {
    mockDatabase = DatabaseTestHelper.createMockConnection();
    repository = new PaymentRepositorySQL(mockDatabase);
  });

  describe("list", () => {
    test("Should list payments for a contract", async () => {
      const contractId = "4224a279-c162-4283-86f5-1095f559b08c";

      const result = await repository.list({ contrarId: contractId });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    test("Should return Payment entities", async () => {
      const contractId = "4224a279-c162-4283-86f5-1095f559b08c";

      const result = await repository.list({ contrarId: contractId });

      result.forEach((payment) => {
        expect(payment).toHaveProperty("idPayment");
        expect(payment).toHaveProperty("date");
        expect(payment).toHaveProperty("amount");
      });
    });

    test("Should filter by contract ID", async () => {
      const contractId = "4224a279-c162-4283-86f5-1095f559b08c";
      const querySpy = jest.spyOn(mockDatabase, "query");

      await repository.list({ contrarId: contractId });

      expect(querySpy).toHaveBeenCalledWith(
        "SELECT * FROM sam.payment WHERE id_contract = $1",
        [contractId],
      );
    });

    test("Should parse amount as number", async () => {
      const contractId = "4224a279-c162-4283-86f5-1095f559b08c";

      const result = await repository.list({ contrarId: contractId });

      result.forEach((payment) => {
        expect(typeof payment.amount).toBe("number");
      });
    });

    test("Should parse date correctly", async () => {
      const contractId = "4224a279-c162-4283-86f5-1095f559b08c";

      const result = await repository.list({ contrarId: contractId });

      result.forEach((payment) => {
        expect(payment.date).toBeInstanceOf(Date);
      });
    });

    test("Should handle empty result set", async () => {
      mockDatabase.setMockData("payments", []);

      const result = await repository.list({ contrarId: "non-existent" });

      expect(result).toEqual([]);
    });

    test("Should handle multiple payments", async () => {
      mockDatabase.setMockData("payments", [
        {
          id_payment: "payment-1",
          id_contract: "contract-1",
          amount: 100,
          date: new Date("2022-01-01"),
        },
        {
          id_payment: "payment-2",
          id_contract: "contract-1",
          amount: 200,
          date: new Date("2022-02-01"),
        },
        {
          id_payment: "payment-3",
          id_contract: "contract-1",
          amount: 300,
          date: new Date("2022-03-01"),
        },
      ]);

      const result = await repository.list({ contrarId: "contract-1" });

      expect(result).toHaveLength(3);
    });

    test("Should only return payments for specified contract", async () => {
      mockDatabase.setMockData("payments", [
        {
          id_payment: "payment-1",
          id_contract: "contract-1",
          amount: 100,
          date: new Date("2022-01-01"),
        },
        {
          id_payment: "payment-2",
          id_contract: "contract-2",
          amount: 200,
          date: new Date("2022-02-01"),
        },
      ]);

      const result = await repository.list({ contrarId: "contract-1" });

      result.forEach((payment) => {
        // Should only contain payments for contract-1
        expect(payment.idPayment).toBe("payment-1");
      });
    });

    test("Should propagate database errors", async () => {
      const errorDatabase = {
        query: jest.fn().mockRejectedValue(new Error("Query failed")),
      };

      const errorRepository = new PaymentRepositorySQL(errorDatabase as any);

      await expect(
        errorRepository.list({ contrarId: "any-id" }),
      ).rejects.toThrow("Query failed");
    });

    test("Should handle decimal amounts", async () => {
      mockDatabase.setMockData("payments", [
        {
          id_payment: "payment-1",
          id_contract: "contract-1",
          amount: 123.45,
          date: new Date("2022-01-01"),
        },
      ]);

      const result = await repository.list({ contrarId: "contract-1" });

      expect(result[0].amount).toBeCloseTo(123.45, 2);
    });
  });
});
