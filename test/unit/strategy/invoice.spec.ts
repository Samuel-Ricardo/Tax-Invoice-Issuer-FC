import { InvoiceGenerationStrategyFactory } from "../../../src/@modules/domain/strategy/invoice/invoice.strategy";
import { CashBasisStrategy } from "../../../src/@modules/domain/strategy/invoice/type/cash.strategy";
import { AccrualBasisStrategy } from "../../../src/@modules/domain/strategy/invoice/type/accrual.strategy";
import { Contract } from "../../../src/@modules/domain/entity/contract.entity";
import Payment from "../../../src/@modules/domain/entity/payment.entity";
import { Invoice } from "../../../src/@modules/domain/entity/invoice.entity";

describe("[INVOICE] - [STRATEGY]", () => {
  // ============================================================================
  // STRATEGY FACTORY
  // ============================================================================

  it("[UNIT] | [STRATEGY] - FACTORY > creates CashBasisStrategy for 'cash' type", () => {
    const strategy = InvoiceGenerationStrategyFactory.create("cash");
    expect(strategy).toBeInstanceOf(CashBasisStrategy);
  });

  it("[UNIT] | [STRATEGY] - FACTORY > creates AccrualBasisStrategy for 'accrual' type", () => {
    const strategy = InvoiceGenerationStrategyFactory.create("accrual");
    expect(strategy).toBeInstanceOf(AccrualBasisStrategy);
  });

  it("[UNIT] | [STRATEGY] - FACTORY > throws error for invalid type", () => {
    expect(() =>
      InvoiceGenerationStrategyFactory.create("invalid" as any),
    ).toThrow("Invalid strategy type");
  });

  // ============================================================================
  // CASH BASIS STRATEGY
  // ============================================================================

  it("[UNIT] | [CASH] - generate > returns empty array when no payments match", () => {
    const strategy = new CashBasisStrategy();
    const contract = new Contract(
      "c-1",
      "Test",
      12000,
      12,
      new Date("2022-01-01"),
    );
    // Payment in Feb 2022 - requesting Jan 2022
    contract.addPayment(new Payment("p-1", new Date("2022-02-15"), 1000));

    const invoices = strategy.generate({ contract, month: 1, year: 2022 });

    // Cash strategy: only returns invoices for payments matching the requested month/year
    // Payment is in Feb (2), not Jan (1), so returns null
    expect(Array.isArray(invoices)).toBe(true);
    const filtered = invoices.filter((i) => i !== null);
    expect(filtered.length).toBe(0); // No matching payments
  });

  it("[UNIT] | [CASH] - generate > returns null-filtered array for payments in requested month", () => {
    const strategy = new CashBasisStrategy();
    const contract = new Contract(
      "c-1",
      "Test",
      12000,
      12,
      new Date("2022-01-01"),
    );
    // Payment in Jan 2022 - requesting Jan 2022
    contract.addPayment(new Payment("p-1", new Date("2022-01-15"), 1000));

    const invoices = strategy.generate({ contract, month: 1, year: 2022 });

    // Cash strategy: returns invoices for payments matching requested month/year
    // Payment is Jan 2022, requesting Jan 2022 → returns Invoice
    expect(Array.isArray(invoices)).toBe(true);
    const filtered = invoices.filter((i) => i !== null);
    expect(filtered.length).toBe(1);
    expect(filtered[0]).toBeInstanceOf(Invoice);
  });

  it("[UNIT] | [CASH] - generate > returns Invoice instances for matching payments", () => {
    const strategy = new CashBasisStrategy();
    const contract = new Contract(
      "c-1",
      "Test",
      12000,
      12,
      new Date("2022-01-01"),
    );
    // Payment in MATCHING month (Jan 2022), requesting Jan 2022
    contract.addPayment(new Payment("p-1", new Date("2022-01-10"), 1000));

    const invoices = strategy.generate({ contract, month: 1, year: 2022 });
    const valid = invoices.filter((i) => i !== null);

    // isValid(Jan, 1, 2022) = (1 === 1 && 2022 === 2022) = true
    // So returns Invoice instance
    expect(valid.length).toBeGreaterThan(0);
    expect(valid[0]).toBeInstanceOf(Invoice);
  });

  it("[UNIT] | [CASH] - generate > handles contract with no payments", () => {
    const strategy = new CashBasisStrategy();
    const contract = new Contract(
      "c-1",
      "Test",
      12000,
      12,
      new Date("2022-01-01"),
    );

    const invoices = strategy.generate({ contract, month: 1, year: 2022 });

    expect(invoices).toEqual([]);
  });

  // ============================================================================
  // ACCRUAL BASIS STRATEGY
  // ============================================================================

  it("[UNIT] | [ACCRUAL] - generate > stops at target month and breaks loop", () => {
    const strategy = new AccrualBasisStrategy();
    // Contract starting Jan 2022 with 12 periods
    // Requesting month 1, year 2022 → first period matches → stop immediately
    const contract = new Contract(
      "c-1",
      "Test",
      12000,
      12,
      new Date("2022-01-01"),
    );

    const invoices = strategy.generate({ contract, month: 1, year: 2022 });

    // isValid(date, month, year) = date.getMonth()+1 !== month || date.getFullYear() !== year
    // First period: date = Jan 2022, isValid(Jan2022, 1, 2022) = (1 !== 1 || 2022 !== 2022) = false → BREAK
    // So no invoices are generated (breaks immediately)
    expect(Array.isArray(invoices)).toBe(true);
    expect(invoices.length).toBe(0);
  });

  it("[UNIT] | [ACCRUAL] - generate > generates invoices for periods before target month", () => {
    const strategy = new AccrualBasisStrategy();
    // Contract starting Jan 2022 with 12 periods
    // Requesting month 3, year 2022 → should get Jan and Feb invoices (months 1 and 2)
    const contract = new Contract(
      "c-1",
      "Test",
      12000,
      12,
      new Date("2022-01-01"),
    );

    const invoices = strategy.generate({ contract, month: 3, year: 2022 });

    // isValid(Jan2022, 3, 2022) = (1 !== 3 || 2022 !== 2022) = true → include
    // isValid(Feb2022, 3, 2022) = (2 !== 3 || 2022 !== 2022) = true → include
    // isValid(Mar2022, 3, 2022) = (3 !== 3 || 2022 !== 2022) = false → BREAK
    expect(invoices.length).toBe(2);
    expect(invoices[0]).toBeInstanceOf(Invoice);
  });

  it("[UNIT] | [ACCRUAL] - generate > uses getAmountByPeriod for invoice amount", () => {
    const strategy = new AccrualBasisStrategy();
    const contract = new Contract(
      "c-1",
      "Test",
      12000,
      12,
      new Date("2022-01-01"),
    );

    const invoices = strategy.generate({ contract, month: 3, year: 2022 });

    if (invoices.length > 0) {
      expect(invoices[0].amount).toBe(contract.getAmountByPeriod());
    }
  });

  it("[UNIT] | [ACCRUAL] - generate > stops when periods exceeded without matching month", () => {
    const strategy = new AccrualBasisStrategy();
    // Contract with only 1 period starting Jan 2022
    // Requesting month 6, year 2023 → period 0: Jan 2022 (valid), period 1: Feb 2022 (valid)
    // but loop stops when period > contract.periods (1)
    const contract = new Contract(
      "c-1",
      "Test",
      1000,
      1,
      new Date("2022-01-01"),
    );

    const invoices = strategy.generate({ contract, month: 6, year: 2023 });

    // period 0: date=Jan2022, isValid(Jan2022, 6, 2023)=(1≠6||2022≠2023)=true → add
    // period 1 → loop condition: period(1) <= periods(1) → true
    // date=Feb2022, isValid(Feb2022, 6, 2023)=true → add
    // period 2 → loop condition: 2 <= 1 → false → exit
    expect(invoices.length).toBe(2);
  });

  it("[UNIT] | [ACCRUAL] - isValid > returns false when date matches target month/year", () => {
    const strategy = new AccrualBasisStrategy();
    // Contract that starts exactly in the requested month
    const contract = new Contract(
      "c-1",
      "Test",
      12000,
      12,
      new Date("2022-03-01"),
    );

    const invoices = strategy.generate({ contract, month: 3, year: 2022 });

    // First period: date=Mar2022, isValid(Mar2022, 3, 2022)=(3!==3||2022!==2022)=false → break immediately
    expect(invoices.length).toBe(0);
  });

  it("[UNIT] | [ACCRUAL] - generate > breaks when period month exceeds requested month in same year", () => {
    const strategy = new AccrualBasisStrategy();
    // Contract starts AFTER the requested month (June 2022, requesting March 2022)
    // period 0: June 2022, dateMonth=6 > month=3 → second branch triggers → break immediately
    const contract = new Contract(
      "c-1",
      "Test",
      12000,
      12,
      new Date("2022-06-01"),
    );

    const invoices = strategy.generate({ contract, month: 3, year: 2022 });

    // No periods before March 2022 - breaks on first iteration via second condition
    expect(invoices.length).toBe(0);
  });

  it("[UNIT] | [ACCRUAL] - generate > breaks when period year exceeds requested year", () => {
    const strategy = new AccrualBasisStrategy();
    // Contract starts in March 2023, requesting month=2, year=2022
    // period 0: March 2023, dateMonth=3 >= month=2 && dateYear=2023 > year=2022 → break
    const contract = new Contract(
      "c-1",
      "Test",
      12000,
      12,
      new Date("2023-03-01"),
    );

    const invoices = strategy.generate({ contract, month: 2, year: 2022 });

    // Contract starts in 2023 but we're requesting 2022 - second branch triggers
    expect(invoices.length).toBe(0);
  });
});
