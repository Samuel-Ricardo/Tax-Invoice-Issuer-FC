import { InvoiceGenerationStrategyFactory } from "../../../../../src/@modules/domain/strategy/invoice/invoice.strategy";
import { AccrualBasisStrategy } from "../../../../../src/@modules/domain/strategy/invoice/type/accrual.strategy";
import { CashBasisStrategy } from "../../../../../src/@modules/domain/strategy/invoice/type/cash.strategy";

describe("[UNIT] Factory - InvoiceGenerationStrategyFactory", () => {
  describe("create", () => {
    test('Should create CashBasisStrategy when type is "cash"', () => {
      const strategy = InvoiceGenerationStrategyFactory.create("cash");

      expect(strategy).toBeInstanceOf(CashBasisStrategy);
    });

    test('Should create AccrualBasisStrategy when type is "accrual"', () => {
      const strategy = InvoiceGenerationStrategyFactory.create("accrual");

      expect(strategy).toBeInstanceOf(AccrualBasisStrategy);
    });

    test("Should throw error for invalid strategy type", () => {
      expect(() => {
        InvoiceGenerationStrategyFactory.create("invalid" as any);
      }).toThrow("Invalid strategy type");
    });

    test("Should throw error for undefined type", () => {
      expect(() => {
        InvoiceGenerationStrategyFactory.create(undefined as any);
      }).toThrow("Invalid strategy type");
    });

    test("Should throw error for null type", () => {
      expect(() => {
        InvoiceGenerationStrategyFactory.create(null as any);
      }).toThrow("Invalid strategy type");
    });

    test("Should create different instances on multiple calls", () => {
      const strategy1 = InvoiceGenerationStrategyFactory.create("cash");
      const strategy2 = InvoiceGenerationStrategyFactory.create("cash");

      expect(strategy1).not.toBe(strategy2);
      expect(strategy1).toBeInstanceOf(CashBasisStrategy);
      expect(strategy2).toBeInstanceOf(CashBasisStrategy);
    });
  });
});
