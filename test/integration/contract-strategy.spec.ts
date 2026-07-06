import { Contract } from "../../src/@modules/domain/entity/contract.entity";
import Payment from "../../src/@modules/domain/entity/payment.entity";
import { Invoice } from "../../src/@modules/domain/entity/invoice.entity";
import { CashBasisStrategy } from "../../src/@modules/domain/strategy/invoice/type/cash.strategy";
import { AccrualBasisStrategy } from "../../src/@modules/domain/strategy/invoice/type/accrual.strategy";
import { InvoiceGenerationStrategyFactory } from "../../src/@modules/domain/strategy/invoice/invoice.strategy";

/**
 * Integration tests: Contract entity ↔ Strategy layer
 *
 * These tests validate that the Contract entity correctly integrates with
 * both Cash and Accrual strategies without mocking internal domain logic.
 * No database or external services involved.
 */

describe("[INTEGRATION] | [CONTRACT] <-> [STRATEGY]", () => {
  // ============================================================================
  // CASH BASIS INTEGRATION
  // ============================================================================

  describe("Cash Basis", () => {
    it("[INTEGRATION] | [CASH] - contract.generateInvoices with payments returns correct structure", () => {
      const contract = new Contract(
        "c-1",
        "Consulting",
        12000,
        12,
        new Date("2022-01-01"),
      );
      // Payment in January 2022
      contract.addPayment(new Payment("p-1", new Date("2022-01-15"), 1000));
      // Payment in February 2022
      contract.addPayment(new Payment("p-2", new Date("2022-02-10"), 2000));

      const invoices = contract.generateInvoices({
        month: 1,
        year: 2022,
        type: "cash",
      });

      expect(Array.isArray(invoices)).toBe(true);
      // Valid invoices (non-null) should be Invoice instances
      const valid = invoices.filter((i): i is Invoice => i !== null);
      valid.forEach((inv) => {
        expect(inv).toBeInstanceOf(Invoice);
        expect(inv).toHaveProperty("date");
        expect(inv).toHaveProperty("amount");
      });
    });

    it("[INTEGRATION] | [CASH] - strategy and entity together filter by month boundary", () => {
      const contract = new Contract(
        "c-1",
        "Consulting",
        6000,
        6,
        new Date("2022-01-01"),
      );
      // Payments across multiple months
      contract.addPayment(new Payment("p-1", new Date("2022-03-10"), 1000)); // March
      contract.addPayment(new Payment("p-2", new Date("2022-03-20"), 1500)); // March
      contract.addPayment(new Payment("p-3", new Date("2022-04-05"), 2000)); // April

      const strategy = new CashBasisStrategy();
      const result = strategy.generate({ contract, month: 3, year: 2022 });

      // March payments → isValid(Mar, 3, 2022) = (3===3 && 2022===2022) = true → Invoice
      // April payment → isValid(Apr, 3, 2022) = (4===3 && 2022===2022) = false → null (filtered)
      const validInvoices = result.filter((i): i is Invoice => i !== null);
      expect(validInvoices.length).toBe(2); // Two March payments (p-1 + p-2)
      const totalAmount = validInvoices.reduce((sum, i) => sum + i.amount, 0);
      expect(totalAmount).toBe(2500); // 1000 + 1500
    });

    it("[INTEGRATION] | [CASH] - balance is correctly maintained after addPayment", () => {
      const contract = new Contract(
        "c-1",
        "Consulting",
        12000,
        12,
        new Date("2022-01-01"),
      );
      contract.addPayment(new Payment("p-1", new Date("2022-01-15"), 3000));
      contract.addPayment(new Payment("p-2", new Date("2022-02-10"), 2000));

      expect(contract.getBalance()).toBe(7000);
      expect(contract.payments).toHaveLength(2);

      const invoices = contract.generateInvoices({
        month: 1,
        year: 2022,
        type: "cash",
      });

      // Balance unchanged after invoice generation
      expect(contract.getBalance()).toBe(7000);
      expect(Array.isArray(invoices)).toBe(true);
    });
  });

  // ============================================================================
  // ACCRUAL BASIS INTEGRATION
  // ============================================================================

  describe("Accrual Basis", () => {
    it("[INTEGRATION] | [ACCRUAL] - generates proportional invoice amounts", () => {
      const contract = new Contract(
        "c-1",
        "License",
        12000,
        12,
        new Date("2022-01-01"),
      );

      const invoices = contract.generateInvoices({
        month: 3,
        year: 2022,
        type: "accrual",
      });

      // Months before March: Jan(1), Feb(2) → 2 invoices
      expect(invoices.length).toBe(2);
      invoices.forEach((inv) => {
        expect(inv.amount).toBe(1000); // 12000 / 12
      });
    });

    it("[INTEGRATION] | [ACCRUAL] - contract.getAmountByPeriod matches invoice amounts", () => {
      const contract = new Contract(
        "c-1",
        "Service",
        9000,
        3,
        new Date("2022-01-01"),
      );

      const invoices = contract.generateInvoices({
        month: 2,
        year: 2022,
        type: "accrual",
      });

      // Only Jan period (month 1 != 2): 1 invoice
      expect(invoices.length).toBe(1);
      expect(invoices[0].amount).toBe(contract.getAmountByPeriod()); // 3000
    });

    it("[INTEGRATION] | [ACCRUAL] - returns empty when requesting first month of contract", () => {
      const contract = new Contract(
        "c-1",
        "Service",
        12000,
        12,
        new Date("2022-06-01"),
      );

      const invoices = contract.generateInvoices({
        month: 6,
        year: 2022,
        type: "accrual",
      });

      // First period IS the requested month → isValid = false → break immediately
      expect(invoices.length).toBe(0);
    });
  });

  // ============================================================================
  // STRATEGY COMPARISON
  // ============================================================================

  describe("Cash vs Accrual Comparison", () => {
    it("[INTEGRATION] | [STRATEGIES] - cash and accrual produce different results for same input", () => {
      const contract = new Contract(
        "c-1",
        "Consulting",
        12000,
        12,
        new Date("2022-01-01"),
      );
      contract.addPayment(new Payment("p-1", new Date("2022-02-15"), 1000)); // Feb payment

      // Using month=3 to differentiate: cash checks payments on month 3 (none), accrual generates Jan+Feb
      const cashInvoices = contract.generateInvoices({
        month: 3,
        year: 2022,
        type: "cash",
      });
      const accrualInvoices = contract.generateInvoices({
        month: 3,
        year: 2022,
        type: "accrual",
      });

      // Cash: Feb payment doesn't match March → returns []
      // Accrual: periods before March = Jan + Feb → returns 2 invoices
      expect(cashInvoices.length).not.toBe(accrualInvoices.length); // 0 !== 2
      expect(cashInvoices.length).toBe(0);
      expect(accrualInvoices.length).toBe(2);
    });

    it("[INTEGRATION] | [FACTORY] - factory creates correct strategy instances", () => {
      const cashStrategy = InvoiceGenerationStrategyFactory.create("cash");
      const accrualStrategy =
        InvoiceGenerationStrategyFactory.create("accrual");

      expect(cashStrategy).toBeInstanceOf(CashBasisStrategy);
      expect(accrualStrategy).toBeInstanceOf(AccrualBasisStrategy);
    });

    it("[INTEGRATION] | [FACTORY] - throws for unknown strategy type", () => {
      expect(() =>
        InvoiceGenerationStrategyFactory.create("unknown" as any),
      ).toThrow("Invalid strategy type");
    });
  });
});
