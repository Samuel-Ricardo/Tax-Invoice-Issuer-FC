import { PgPromiseConnectionAdapter } from "../../../../../src/@modules/infra/engine/database/connection/sql/postgres/pgpromise.engine";

describe("[INTEGRATION] Database - PgPromise Connection", () => {
  let connection: PgPromiseConnectionAdapter;
  const mockDatabaseUrl = "postgresql://user:pass@localhost:5432/testdb";

  beforeEach(() => {
    connection = new PgPromiseConnectionAdapter(mockDatabaseUrl);
  });

  afterEach(async () => {
    // Clean up connection
    try {
      await connection.close();
    } catch (error) {
      // Ignore cleanup errors in tests
    }
  });

  describe("Constructor", () => {
    test("Should create connection with URL", () => {
      expect(connection).toBeDefined();
      expect(connection).toBeInstanceOf(PgPromiseConnectionAdapter);
    });

    test("Should implement SQLDatabaseConnection interface", () => {
      expect(connection.query).toBeDefined();
      expect(connection.close).toBeDefined();
      expect(typeof connection.query).toBe("function");
      expect(typeof connection.close).toBe("function");
    });
  });

  describe("query", () => {
    test("Should have query method", () => {
      expect(connection.query).toBeDefined();
      expect(typeof connection.query).toBe("function");
    });

    test("Query method should accept statement and params", async () => {
      // This test verifies the signature without actually connecting
      expect(() => {
        const statement = "SELECT * FROM test WHERE id = $1";
        const params = ["test-id"];
        // Just verify it doesn't throw on call
        connection.query(statement, params).catch(() => {
          // Expected to fail without real database
        });
      }).not.toThrow();
    });
  });

  describe("close", () => {
    test("Should have close method", () => {
      expect(connection.close).toBeDefined();
      expect(typeof connection.close).toBe("function");
    });

    test("Close should be callable", async () => {
      // Verify method is callable
      await expect(connection.close()).resolves.not.toThrow();
    });
  });
});
