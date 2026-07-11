import { ContractRepositorySQL } from "../../../../src/@modules/application/repository/sql/contract.repository";
import { DatabaseTestHelper } from "../../../helpers/database.helper";

describe("[INTEGRATION] Repository - Contract SQL", () => {
  let repository: ContractRepositorySQL;
  let mockDatabase: any;

  beforeEach(() => {
    mockDatabase = DatabaseTestHelper.createMockConnection();
    repository = new ContractRepositorySQL(mockDatabase);
  });

  describe("list", () => {
    test("Should list all contracts from database", async () => {
      const result = await repository.list();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    test("Should return Contract entities", async () => {
      const result = await repository.list();

      result.forEach((contract) => {
        expect(contract).toHaveProperty("idContract");
        expect(contract).toHaveProperty("description");
        expect(contract).toHaveProperty("amount");
        expect(contract).toHaveProperty("periods");
        expect(contract).toHaveProperty("date");
        expect(contract).toHaveProperty("payments");
      });
    });

    test("Should parse amount as number", async () => {
      const result = await repository.list();

      result.forEach((contract) => {
        expect(typeof contract.amount).toBe("number");
        expect(contract.amount).toBeGreaterThanOrEqual(0);
      });
    });

    test("Should parse date correctly", async () => {
      const result = await repository.list();

      result.forEach((contract) => {
        expect(contract.date).toBeInstanceOf(Date);
      });
    });

    test("Should initialize payments array", async () => {
      const result = await repository.list();

      result.forEach((contract) => {
        expect(Array.isArray(contract.payments)).toBe(true);
      });
    });

    test("Should query correct table", async () => {
      const querySpy = jest.spyOn(mockDatabase, "query");

      await repository.list();

      expect(querySpy).toHaveBeenCalledWith("SELECT * FROM sam.contract", []);
    });

    test("Should handle empty result set", async () => {
      mockDatabase.setMockData("contracts", []);

      const result = await repository.list();

      expect(result).toEqual([]);
    });

    test("Should handle multiple contracts", async () => {
      mockDatabase.setMockData("contracts", [
        {
          id_contract: "contract-1",
          description: "Service 1",
          amount: 1000,
          periods: 10,
          date: new Date("2022-01-01"),
        },
        {
          id_contract: "contract-2",
          description: "Service 2",
          amount: 2000,
          periods: 20,
          date: new Date("2022-02-01"),
        },
        {
          id_contract: "contract-3",
          description: "Service 3",
          amount: 3000,
          periods: 30,
          date: new Date("2022-03-01"),
        },
      ]);

      const result = await repository.list();

      expect(result).toHaveLength(3);
    });

    test("Should propagate database errors", async () => {
      const errorDatabase = {
        query: jest.fn().mockRejectedValue(new Error("Connection failed")),
      };

      const errorRepository = new ContractRepositorySQL(errorDatabase as any);

      await expect(errorRepository.list()).rejects.toThrow("Connection failed");
    });
  });
});
