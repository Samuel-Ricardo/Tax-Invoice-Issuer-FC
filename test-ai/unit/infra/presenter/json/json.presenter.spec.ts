import { JsonPresenter } from "../../../../../src/@modules/infra/presenter/json/json.presenter";

describe("[UNIT] Presenter - JSON", () => {
  let presenter: JsonPresenter;

  beforeEach(() => {
    presenter = new JsonPresenter();
  });

  describe("present", () => {
    test("Should convert object to JSON string", () => {
      const data = { id: 1, name: "Test" };

      const result = presenter.present(data);

      expect(result).toBe(JSON.stringify(data));
      expect(typeof result).toBe("string");
    });

    test("Should handle arrays", () => {
      const data = [1, 2, 3, 4, 5];

      const result = presenter.present(data);

      expect(result).toBe(JSON.stringify(data));
    });

    test("Should handle nested objects", () => {
      const data = {
        user: {
          id: 1,
          profile: {
            name: "John",
            age: 30,
          },
        },
      };

      const result = presenter.present(data);

      expect(result).toBe(JSON.stringify(data));
    });

    test("Should handle null", () => {
      const result = presenter.present(null);

      expect(result).toBe("null");
    });

    test("Should handle undefined", () => {
      const result = presenter.present(undefined);

      expect(result).toBe(undefined);
    });

    test("Should handle empty object", () => {
      const result = presenter.present({});

      expect(result).toBe("{}");
    });

    test("Should handle empty array", () => {
      const result = presenter.present([]);

      expect(result).toBe("[]");
    });

    test("Should handle strings", () => {
      const result = presenter.present("test string");

      expect(result).toBe('"test string"');
    });

    test("Should handle numbers", () => {
      const result = presenter.present(42);

      expect(result).toBe("42");
    });

    test("Should handle booleans", () => {
      expect(presenter.present(true)).toBe("true");
      expect(presenter.present(false)).toBe("false");
    });

    test("Should handle dates as ISO strings", () => {
      const date = new Date("2022-01-01T10:00:00");
      const result = presenter.present(date);

      expect(result).toBe(JSON.stringify(date));
    });

    test("Should handle complex invoice data", () => {
      const invoiceData = {
        id: "inv-123",
        date: new Date("2022-01-01"),
        amount: 500.5,
        items: [
          { name: "Item 1", quantity: 2, price: 100.25 },
          { name: "Item 2", quantity: 3, price: 100 },
        ],
      };

      const result = presenter.present(invoiceData);

      expect(result).toBe(JSON.stringify(invoiceData));
      expect(() => JSON.parse(result)).not.toThrow();
    });
  });
});
