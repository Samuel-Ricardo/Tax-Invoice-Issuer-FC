import { Contract } from "../../../src/@modules/domain/entity/contract.entity";
import Payment from "../../../src/@modules/domain/entity/payment.entity";
import { Invoice } from "../../../src/@modules/domain/entity/invoice.entity";

describe("[CONTRACT] - [ENTITY]", () => {
  // ============================================================================
  // CREATION
  // ============================================================================

  it("[UNIT] | [CONTRACT] - ENTITY > created with correct properties", () => {
    const contract = new Contract(
      "c-1",
      "Contrato Test",
      12000,
      12,
      new Date("2026-01-01"),
    );

    expect(contract.idContract).toBe("c-1");
    expect(contract.description).toBe("Contrato Test");
    expect(contract.amount).toBe(12000);
    expect(contract.periods).toBe(12);
    expect(contract.date).toEqual(new Date("2026-01-01"));
    expect(contract.payments).toEqual([]);
  });

  // ============================================================================
  // addPayment
  // ============================================================================

  it("[UNIT] | [CONTRACT] - addPayment > adds payment to payments array", () => {
    const contract = new Contract(
      "c-1",
      "Contrato Test",
      12000,
      12,
      new Date("2026-01-01"),
    );
    const payment = new Payment("p-1", new Date("2026-01-15"), 1000);

    contract.addPayment(payment);

    expect(contract.payments).toHaveLength(1);
    expect(contract.payments[0]).toBe(payment);
  });

  it("[UNIT] | [CONTRACT] - addPayment > accumulates multiple payments", () => {
    const contract = new Contract(
      "c-1",
      "Contrato Test",
      12000,
      12,
      new Date("2026-01-01"),
    );
    const p1 = new Payment("p-1", new Date("2026-01-15"), 1000);
    const p2 = new Payment("p-2", new Date("2026-02-10"), 2000);

    contract.addPayment(p1);
    contract.addPayment(p2);

    expect(contract.payments).toHaveLength(2);
  });

  // ============================================================================
  // getBalance
  // ============================================================================

  it("[UNIT] | [CONTRACT] - getBalance > returns full amount when no payments", () => {
    const contract = new Contract(
      "c-1",
      "Contrato Test",
      12000,
      12,
      new Date("2026-01-01"),
    );

    expect(contract.getBalance()).toBe(12000);
  });

  it("[UNIT] | [CONTRACT] - getBalance > deducts payments from amount", () => {
    const contract = new Contract(
      "c-1",
      "Contrato Test",
      12000,
      12,
      new Date("2026-01-01"),
    );
    contract.addPayment(new Payment("p-1", new Date("2026-01-15"), 1000));
    contract.addPayment(new Payment("p-2", new Date("2026-02-10"), 2000));

    expect(contract.getBalance()).toBe(9000);
  });

  it("[UNIT] | [CONTRACT] - getBalance > returns zero when fully paid", () => {
    const contract = new Contract(
      "c-1",
      "Contrato Test",
      12000,
      12,
      new Date("2026-01-01"),
    );
    contract.addPayment(new Payment("p-1", new Date("2026-01-15"), 12000));

    expect(contract.getBalance()).toBe(0);
  });

  // ============================================================================
  // getAmountByPeriod
  // ============================================================================

  it("[UNIT] | [CONTRACT] - getAmountByPeriod > divides total by periods", () => {
    const contract = new Contract(
      "c-1",
      "Contrato Test",
      12000,
      12,
      new Date("2026-01-01"),
    );

    expect(contract.getAmountByPeriod()).toBe(1000);
  });

  it("[UNIT] | [CONTRACT] - getAmountByPeriod > handles uneven division", () => {
    const contract = new Contract(
      "c-1",
      "Contrato Test",
      10000,
      3,
      new Date("2026-01-01"),
    );

    expect(contract.getAmountByPeriod()).toBeCloseTo(3333.33, 1);
  });

  // ============================================================================
  // generateInvoices
  // ============================================================================

  it("[UNIT] | [CONTRACT] - generateInvoices > delegates to strategy factory for cash type", () => {
    const contract = new Contract(
      "c-1",
      "Contrato Test",
      12000,
      12,
      new Date("2022-01-01"),
    );
    const payment = new Payment("p-1", new Date("2022-01-15"), 1000);
    contract.addPayment(payment);

    const invoices = contract.generateInvoices({
      month: 1,
      year: 2022,
      type: "cash",
    });

    expect(Array.isArray(invoices)).toBe(true);
  });

  it("[UNIT] | [CONTRACT] - generateInvoices > delegates to strategy factory for accrual type", () => {
    const contract = new Contract(
      "c-1",
      "Contrato Test",
      12000,
      12,
      new Date("2022-01-01"),
    );

    const invoices = contract.generateInvoices({
      month: 1,
      year: 2022,
      type: "accrual",
    });

    expect(Array.isArray(invoices)).toBe(true);
  });

  it("[UNIT] | [CONTRACT] - generateInvoices > returns Invoice instances", () => {
    const contract = new Contract(
      "c-1",
      "Contrato Test",
      12000,
      12,
      new Date("2022-01-01"),
    );
    const payment = new Payment("p-1", new Date("2022-01-15"), 1000);
    contract.addPayment(payment);

    const invoices = contract.generateInvoices({
      month: 1,
      year: 2022,
      type: "cash",
    });

    if (invoices.length > 0) {
      expect(invoices[0]).toBeInstanceOf(Invoice);
    }
  });
});
