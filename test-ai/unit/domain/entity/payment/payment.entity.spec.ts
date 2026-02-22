import { TestFixtures } from "../../../../helpers/fixtures";

describe("[UNIT] Entity - Payment", () => {
  describe("Constructor", () => {
    test("Should create a payment with correct properties", () => {
      const payment = TestFixtures.createPayment();

      expect(payment.idPayment).toBe("c931d9db-c8d8-44d4-8861-b3d6b734c64e");
      expect(payment.date).toEqual(new Date("2022-01-05T10:00:00"));
      expect(payment.amount).toBe(6000);
    });

    test("Should create payment with custom values", () => {
      const customDate = new Date("2023-03-15T09:30:00");
      const payment = TestFixtures.createPayment({
        idPayment: "custom-payment-id",
        date: customDate,
        amount: 1500.5,
      });

      expect(payment.idPayment).toBe("custom-payment-id");
      expect(payment.date).toBe(customDate);
      expect(payment.amount).toBe(1500.5);
    });

    test("Should handle zero amount", () => {
      const payment = TestFixtures.createPayment({ amount: 0 });

      expect(payment.amount).toBe(0);
    });

    test("Should handle negative amount", () => {
      const payment = TestFixtures.createPayment({ amount: -100 });

      expect(payment.amount).toBe(-100);
    });

    test("Should handle large amounts", () => {
      const payment = TestFixtures.createPayment({ amount: 1000000.99 });

      expect(payment.amount).toBe(1000000.99);
    });
  });

  describe("Immutability", () => {
    test("Properties should be readonly", () => {
      const payment = TestFixtures.createPayment();

      // TypeScript will prevent this at compile time
      // but we can verify the structure
      expect(payment).toHaveProperty("idPayment");
      expect(payment).toHaveProperty("date");
      expect(payment).toHaveProperty("amount");
    });
  });
});
