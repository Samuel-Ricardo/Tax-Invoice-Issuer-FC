import { TestFixtures } from "../../../../helpers/fixtures";

describe("[UNIT] Entity - Contract", () => {
  describe("Constructor", () => {
    test("Should create a contract with correct properties", () => {
      const contract = TestFixtures.createContract();

      expect(contract.idContract).toBe("4224a279-c162-4283-86f5-1095f559b08c");
      expect(contract.description).toBe("Prestação de serviços escolares");
      expect(contract.amount).toBe(6000);
      expect(contract.periods).toBe(12);
      expect(contract.date).toEqual(new Date("2022-01-01T10:00:00"));
      expect(contract.payments).toEqual([]);
    });

    test("Should create contract with custom values", () => {
      const customDate = new Date("2023-06-15T14:30:00");
      const contract = TestFixtures.createContract({
        idContract: "custom-id-123",
        description: "Custom service",
        amount: 10000,
        periods: 24,
        date: customDate,
      });

      expect(contract.idContract).toBe("custom-id-123");
      expect(contract.description).toBe("Custom service");
      expect(contract.amount).toBe(10000);
      expect(contract.periods).toBe(24);
      expect(contract.date).toBe(customDate);
    });
  });

  describe("addPayment", () => {
    test("Should add a payment to contract", () => {
      const contract = TestFixtures.createContract();
      const payment = TestFixtures.createPayment();

      contract.addPayment(payment);

      expect(contract.payments).toHaveLength(1);
      expect(contract.payments[0]).toBe(payment);
    });

    test("Should add multiple payments to contract", () => {
      const contract = TestFixtures.createContract();
      const payment1 = TestFixtures.createPayment({ idPayment: "payment-1" });
      const payment2 = TestFixtures.createPayment({ idPayment: "payment-2" });
      const payment3 = TestFixtures.createPayment({ idPayment: "payment-3" });

      contract.addPayment(payment1);
      contract.addPayment(payment2);
      contract.addPayment(payment3);

      expect(contract.payments).toHaveLength(3);
      expect(contract.payments).toContain(payment1);
      expect(contract.payments).toContain(payment2);
      expect(contract.payments).toContain(payment3);
    });
  });

  describe("getBalance", () => {
    test("Should return full amount when no payments", () => {
      const contract = TestFixtures.createContract({ amount: 6000 });

      const balance = contract.getBalance();

      expect(balance).toBe(6000);
    });

    test("Should calculate balance with one payment", () => {
      const contract = TestFixtures.createContract({ amount: 6000 });
      const payment = TestFixtures.createPayment({ amount: 2000 });

      contract.addPayment(payment);
      const balance = contract.getBalance();

      expect(balance).toBe(4000);
    });

    test("Should calculate balance with multiple payments", () => {
      const contract = TestFixtures.createContract({ amount: 6000 });
      contract.addPayment(TestFixtures.createPayment({ amount: 1000 }));
      contract.addPayment(TestFixtures.createPayment({ amount: 1500 }));
      contract.addPayment(TestFixtures.createPayment({ amount: 2000 }));

      const balance = contract.getBalance();

      expect(balance).toBe(1500); // 6000 - 1000 - 1500 - 2000
    });

    test("Should return zero when payments equal amount", () => {
      const contract = TestFixtures.createContract({ amount: 6000 });
      contract.addPayment(TestFixtures.createPayment({ amount: 6000 }));

      const balance = contract.getBalance();

      expect(balance).toBe(0);
    });

    test("Should return negative when payments exceed amount", () => {
      const contract = TestFixtures.createContract({ amount: 6000 });
      contract.addPayment(TestFixtures.createPayment({ amount: 7000 }));

      const balance = contract.getBalance();

      expect(balance).toBe(-1000);
    });
  });

  describe("getAmountByPeriod", () => {
    test("Should calculate monthly amount correctly", () => {
      const contract = TestFixtures.createContract({
        amount: 6000,
        periods: 12,
      });

      const monthlyAmount = contract.getAmountByPeriod();

      expect(monthlyAmount).toBe(500); // 6000 / 12
    });

    test("Should handle different periods", () => {
      const contract = TestFixtures.createContract({
        amount: 10000,
        periods: 20,
      });

      const periodAmount = contract.getAmountByPeriod();

      expect(periodAmount).toBe(500); // 10000 / 20
    });

    test("Should handle single period", () => {
      const contract = TestFixtures.createContract({
        amount: 5000,
        periods: 1,
      });

      const periodAmount = contract.getAmountByPeriod();

      expect(periodAmount).toBe(5000);
    });

    test("Should handle decimal results", () => {
      const contract = TestFixtures.createContract({
        amount: 1000,
        periods: 3,
      });

      const periodAmount = contract.getAmountByPeriod();

      expect(periodAmount).toBeCloseTo(333.33, 2);
    });
  });

  describe("generateInvoices", () => {
    test("Should generate invoices with cash strategy", () => {
      const contract = TestFixtures.createContractWithPayments();

      const invoices = contract.generateInvoices({
        month: 1,
        year: 2022,
        type: "cash",
      });

      expect(Array.isArray(invoices)).toBe(true);
    });

    test("Should generate invoices with accrual strategy", () => {
      const contract = TestFixtures.createContract();

      const invoices = contract.generateInvoices({
        month: 1,
        year: 2022,
        type: "accrual",
      });

      expect(Array.isArray(invoices)).toBe(true);
    });

    test("Should throw error with invalid strategy type", () => {
      const contract = TestFixtures.createContract();

      expect(() => {
        contract.generateInvoices({
          month: 1,
          year: 2022,
          type: "invalid" as any,
        });
      }).toThrow("Invalid strategy type");
    });
  });
});
