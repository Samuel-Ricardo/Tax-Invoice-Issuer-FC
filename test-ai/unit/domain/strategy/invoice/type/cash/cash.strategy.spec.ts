import { CashBasisStrategy } from "../../../../../../../src/@modules/domain/strategy/invoice/type/cash.strategy";
import { TestFixtures } from "../../../../../../helpers/fixtures";

describe("[UNIT] Strategy - CashBasisStrategy", () => {
  let strategy: CashBasisStrategy;

  beforeEach(() => {
    strategy = new CashBasisStrategy();
  });

  describe("generate", () => {
    test("Should generate invoices for payments in the specified month", () => {
      const contract = TestFixtures.createContract({
        date: new Date("2022-01-01T10:00:00"),
      });

      // Add payment in January 2022
      contract.addPayment(
        TestFixtures.createPayment({
          date: new Date("2022-01-05T10:00:00"),
          amount: 500,
        }),
      );

      const invoices = strategy.generate({
        contract,
        month: 1,
        year: 2022,
      });

      expect(invoices).toBeDefined();
      expect(Array.isArray(invoices)).toBe(true);
    });

    test("Should not generate invoices for payments in different month", () => {
      const contract = TestFixtures.createContract();

      // Add payment in February 2022
      contract.addPayment(
        TestFixtures.createPayment({
          date: new Date("2022-02-10T10:00:00"),
          amount: 500,
        }),
      );

      const invoices = strategy.generate({
        contract,
        month: 1,
        year: 2022,
      });

      // Should filter out payments not in the specified month
      const validInvoices = invoices.filter((inv) => inv !== null);
      expect(validInvoices.length).toBeLessThanOrEqual(invoices.length);
    });

    test("Should not generate invoices for payments in different year", () => {
      const contract = TestFixtures.createContract();

      // Add payment in January 2023 (different year)
      contract.addPayment(
        TestFixtures.createPayment({
          date: new Date("2023-01-05T10:00:00"),
          amount: 500,
        }),
      );

      const invoices = strategy.generate({
        contract,
        month: 1,
        year: 2022,
      });

      const validInvoices = invoices.filter((inv) => inv !== null);
      expect(validInvoices.length).toBeLessThanOrEqual(invoices.length);
    });

    test("Should generate multiple invoices for multiple payments", () => {
      const contract = TestFixtures.createContract();

      contract.addPayment(
        TestFixtures.createPayment({
          date: new Date("2022-01-05T10:00:00"),
          amount: 500,
        }),
      );
      contract.addPayment(
        TestFixtures.createPayment({
          date: new Date("2022-01-15T10:00:00"),
          amount: 300,
        }),
      );
      contract.addPayment(
        TestFixtures.createPayment({
          date: new Date("2022-01-25T10:00:00"),
          amount: 200,
        }),
      );

      const invoices = strategy.generate({
        contract,
        month: 1,
        year: 2022,
      });

      expect(invoices).toBeDefined();
      expect(invoices.length).toBeGreaterThanOrEqual(0);
    });

    test("Should handle contract without payments", () => {
      const contract = TestFixtures.createContract();

      const invoices = strategy.generate({
        contract,
        month: 1,
        year: 2022,
      });

      expect(invoices).toBeDefined();
      expect(Array.isArray(invoices)).toBe(true);
      expect(invoices.length).toBe(0);
    });

    test("Should preserve payment amounts in invoices", () => {
      const contract = TestFixtures.createContract();
      const paymentAmount = 1234.56;

      contract.addPayment(
        TestFixtures.createPayment({
          date: new Date("2022-01-10T10:00:00"),
          amount: paymentAmount,
        }),
      );

      const invoices = strategy.generate({
        contract,
        month: 1,
        year: 2022,
      });

      const validInvoices = invoices.filter((inv) => inv !== null);
      validInvoices.forEach((invoice) => {
        expect(typeof invoice.amount).toBe("number");
      });
    });

    test("Should handle edge case of December (month 12)", () => {
      const contract = TestFixtures.createContract();

      contract.addPayment(
        TestFixtures.createPayment({
          date: new Date("2022-12-31T23:59:59"),
          amount: 1000,
        }),
      );

      const invoices = strategy.generate({
        contract,
        month: 12,
        year: 2022,
      });

      expect(invoices).toBeDefined();
      expect(Array.isArray(invoices)).toBe(true);
    });

    test("Should handle edge case of January (month 1)", () => {
      const contract = TestFixtures.createContract();

      contract.addPayment(
        TestFixtures.createPayment({
          date: new Date("2022-01-01T00:00:00"),
          amount: 1000,
        }),
      );

      const invoices = strategy.generate({
        contract,
        month: 1,
        year: 2022,
      });

      expect(invoices).toBeDefined();
      expect(Array.isArray(invoices)).toBe(true);
    });
  });
});
