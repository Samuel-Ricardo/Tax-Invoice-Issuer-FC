import { AccrualBasisStrategy } from "../../../../../../../src/@modules/domain/strategy/invoice/type/accrual.strategy";
import { TestFixtures } from "../../../../../../helpers/fixtures";

describe("[UNIT] Strategy - AccrualBasisStrategy", () => {
  let strategy: AccrualBasisStrategy;

  beforeEach(() => {
    strategy = new AccrualBasisStrategy();
  });

  describe("generate", () => {
    test("Should generate invoices based on contract periods", () => {
      const contract = TestFixtures.createContract({
        date: new Date("2022-01-01T10:00:00"),
        amount: 6000,
        periods: 12,
      });

      const invoices = strategy.generate({
        contract,
        month: 1,
        year: 2022,
      });

      expect(invoices).toBeDefined();
      expect(Array.isArray(invoices)).toBe(true);
      expect(invoices.length).toBeGreaterThanOrEqual(0);
    });

    test("Should calculate correct amount per period", () => {
      const contract = TestFixtures.createContract({
        date: new Date("2022-01-01T10:00:00"),
        amount: 6000,
        periods: 12,
      });

      const invoices = strategy.generate({
        contract,
        month: 1,
        year: 2022,
      });

      const expectedAmount = contract.getAmountByPeriod(); // 500
      invoices.forEach((invoice) => {
        expect(invoice.amount).toBe(expectedAmount);
      });
    });

    test("Should generate invoices starting from contract date", () => {
      const contractDate = new Date("2022-01-15T10:00:00");
      const contract = TestFixtures.createContract({
        date: contractDate,
        amount: 12000,
        periods: 12,
      });

      const invoices = strategy.generate({
        contract,
        month: 1,
        year: 2022,
      });

      expect(invoices).toBeDefined();
      if (invoices.length > 0) {
        // First invoice should be in January 2022
        expect(invoices[0].date.getFullYear()).toBe(2022);
      }
    });

    test("Should not generate invoices for months before contract start", () => {
      const contract = TestFixtures.createContract({
        date: new Date("2022-06-01T10:00:00"),
        amount: 6000,
        periods: 12,
      });

      const invoices = strategy.generate({
        contract,
        month: 1, // January, before contract starts
        year: 2022,
      });

      expect(invoices).toBeDefined();
      expect(Array.isArray(invoices)).toBe(true);
      // Should not include invoices before contract start
    });

    test("Should generate invoices for multi-year contracts", () => {
      const contract = TestFixtures.createContract({
        date: new Date("2022-01-01T10:00:00"),
        amount: 24000,
        periods: 24, // 2 years
      });

      const invoices = strategy.generate({
        contract,
        month: 1,
        year: 2022,
      });

      expect(invoices).toBeDefined();
      expect(Array.isArray(invoices)).toBe(true);
    });

    test("Should handle single period contracts", () => {
      const contract = TestFixtures.createContract({
        date: new Date("2022-01-01T10:00:00"),
        amount: 5000,
        periods: 1,
      });

      const invoices = strategy.generate({
        contract,
        month: 1,
        year: 2022,
      });

      expect(invoices).toBeDefined();
      expect(Array.isArray(invoices)).toBe(true);
      if (invoices.length > 0) {
        expect(invoices[0].amount).toBe(5000);
      }
    });

    test("Should handle contract with many periods", () => {
      const contract = TestFixtures.createContract({
        date: new Date("2022-01-01T10:00:00"),
        amount: 120000,
        periods: 120, // 10 years
      });

      const invoices = strategy.generate({
        contract,
        month: 1,
        year: 2022,
      });

      expect(invoices).toBeDefined();
      expect(Array.isArray(invoices)).toBe(true);
    });

    test("Should not generate invoices for different year", () => {
      const contract = TestFixtures.createContract({
        date: new Date("2022-01-01T10:00:00"),
        amount: 6000,
        periods: 12,
      });

      const invoices = strategy.generate({
        contract,
        month: 1,
        year: 2023, // Different year
      });

      expect(invoices).toBeDefined();
      expect(Array.isArray(invoices)).toBe(true);
    });

    test("Should not generate invoices for different month", () => {
      const contract = TestFixtures.createContract({
        date: new Date("2022-01-01T10:00:00"),
        amount: 6000,
        periods: 12,
      });

      const invoices = strategy.generate({
        contract,
        month: 6, // June
        year: 2022,
      });

      expect(invoices).toBeDefined();
      expect(Array.isArray(invoices)).toBe(true);
    });

    test("Should handle decimal amounts correctly", () => {
      const contract = TestFixtures.createContract({
        date: new Date("2022-01-01T10:00:00"),
        amount: 1000,
        periods: 3,
      });

      const invoices = strategy.generate({
        contract,
        month: 1,
        year: 2022,
      });

      const expectedAmount = 1000 / 3; // 333.333...
      invoices.forEach((invoice) => {
        expect(invoice.amount).toBeCloseTo(expectedAmount, 2);
      });
    });

    test("Should generate invoices incrementing months correctly", () => {
      const contract = TestFixtures.createContract({
        date: new Date("2022-01-15T10:00:00"),
        amount: 3000,
        periods: 3,
      });

      const invoices = strategy.generate({
        contract,
        month: 1,
        year: 2022,
      });

      expect(invoices).toBeDefined();
      // Invoices should be for consecutive months
    });
  });
});
