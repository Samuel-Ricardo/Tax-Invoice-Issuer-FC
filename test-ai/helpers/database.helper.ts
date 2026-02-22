import { SQLDatabaseConnection } from "../../src/@modules/infra/engine/database/connection/sql/sql.connection";

export class MockDatabaseConnection implements SQLDatabaseConnection {
  private mockData: Map<string, any[]> = new Map();

  constructor() {
    this.setupMockData();
  }

  private setupMockData() {
    // Mock Contracts
    this.mockData.set("contracts", [
      {
        id_contract: "4224a279-c162-4283-86f5-1095f559b08c",
        description: "Prestação de serviços escolares",
        amount: 6000,
        periods: 12,
        date: new Date("2022-01-01T10:00:00"),
      },
    ]);

    // Mock Payments
    this.mockData.set("payments", [
      {
        id_payment: "c931d9db-c8d8-44d4-8861-b3d6b734c64e",
        id_contract: "4224a279-c162-4283-86f5-1095f559b08c",
        amount: 6000,
        date: new Date("2022-01-05T10:00:00"),
      },
    ]);
  }

  async query(statement: string, params: any[]): Promise<any> {
    if (statement.includes("sam.contract")) {
      return this.mockData.get("contracts");
    }
    if (statement.includes("sam.payment")) {
      const payments = this.mockData.get("payments") || [];
      if (params && params[0]) {
        return payments.filter((p) => p.id_contract === params[0]);
      }
      return payments;
    }
    return [];
  }

  async close(): Promise<void> {
    // Mock implementation
  }

  setMockData(key: string, data: any[]) {
    this.mockData.set(key, data);
  }
}

export class DatabaseTestHelper {
  static createMockConnection(): MockDatabaseConnection {
    return new MockDatabaseConnection();
  }
}
