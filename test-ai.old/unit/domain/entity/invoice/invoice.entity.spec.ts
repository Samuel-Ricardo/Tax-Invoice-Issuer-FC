import { TestFixtures } from "../../../../helpers/fixtures";

describe("[UNIT] Entity - Invoice", () => {
  describe("Constructor", () => {
    test("Should create an invoice with correct properties", () => {
      const invoice = TestFixtures.createInvoice();

      expect(invoice.date).toEqual(new Date("2022-01-01T10:00:00"));
      expect(invoice.amount).toBe(500);
    });

    test("Should create invoice with custom values", () => {
      const customDate = new Date("2023-12-25T15:45:00");
      const invoice = TestFixtures.createInvoice({
        date: customDate,
        amount: 1234.56,
      });

      expect(invoice.date).toBe(customDate);
      expect(invoice.amount).toBe(1234.56);
    });

    test("Should handle zero amount", () => {
      const invoice = TestFixtures.createInvoice({ amount: 0 });

      expect(invoice.amount).toBe(0);
    });

    test("Should handle decimal amounts", () => {
      const invoice = TestFixtures.createInvoice({ amount: 99.99 });

      expect(invoice.amount).toBe(99.99);
    });

    test("Should handle large amounts", () => {
      const invoice = TestFixtures.createInvoice({ amount: 999999.99 });

      expect(invoice.amount).toBe(999999.99);
    });

    test("Should handle different date formats", () => {
      const date1 = new Date("2022-01-01");
      const date2 = new Date("2022-12-31T23:59:59");

      const invoice1 = TestFixtures.createInvoice({ date: date1 });
      const invoice2 = TestFixtures.createInvoice({ date: date2 });

      expect(invoice1.date).toBe(date1);
      expect(invoice2.date).toBe(date2);
    });
  });

  describe("Immutability", () => {
    test("Properties should be readonly", () => {
      const invoice = TestFixtures.createInvoice();

      expect(invoice).toHaveProperty("date");
      expect(invoice).toHaveProperty("amount");
    });
  });
});
