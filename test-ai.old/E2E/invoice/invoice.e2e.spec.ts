import request from "supertest";
import express, { Express } from "express";
import { InvoiceController } from "../../../src/@modules/application/controller/invoice/invoice.controller";
import { MockMediator } from "../../helpers/mediator.helper";
import { DatabaseTestHelper } from "../../helpers/database.helper";
import { ContractRepositorySQL } from "../../../src/@modules/application/repository/sql/contract.repository";
import { PaymentRepositorySQL } from "../../../src/@modules/application/repository/sql/payment.repository";
import { ListContractUseCaseImpl } from "../../../src/@modules/application/use-case/contract/list.use-case";
import { GenerateInvoiceUseCaseImpl } from "../../../src/@modules/application/use-case/invoice/generate.use-case";
import { InvoiceServiceImpl } from "../../../src/@modules/application/service/invoice/invoice.service";
import { JsonPresenter } from "../../../src/@modules/infra/presenter/json/json.presenter";

// Mock HTTP Server for testing
class MockHttpServer {
  private app: Express;
  private routes: Map<string, { method: string; callback: Function }> =
    new Map();

  constructor() {
    this.app = express();
    this.app.use(express.json());
  }

  on(method: string, url: string, callback: Function) {
    const key = `${method.toUpperCase()}:${url}`;
    this.routes.set(key, { method, callback });

    (this.app as any)[method.toLowerCase()](url, async (req: any, res: any) => {
      try {
        const result = await callback(req.params, req.body, req.headers);
        res.json(JSON.parse(result));
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });
  }

  listen() {
    // Mock listen - no actual server started
  }

  getApp() {
    return this.app;
  }
}

describe("[E2E] Invoice Generation - Complete Flow", () => {
  let app: Express;
  let controller: InvoiceController;
  let mockDatabase: any;
  let mockMediator: MockMediator;

  beforeAll(() => {
    // Setup complete application
    mockDatabase = DatabaseTestHelper.createMockConnection();
    mockMediator = new MockMediator();

    const contractRepository = new ContractRepositorySQL(mockDatabase);
    const paymentRepository = new PaymentRepositorySQL(mockDatabase);

    const listContractUseCase = new ListContractUseCaseImpl(
      contractRepository,
      paymentRepository,
    );

    const generateInvoiceUseCase = new GenerateInvoiceUseCaseImpl(
      mockMediator,
      "INVOICE_GENERATED",
    );

    const invoiceService = new InvoiceServiceImpl(
      generateInvoiceUseCase,
      listContractUseCase,
    );

    const mockServer = new MockHttpServer();
    const presenter = new JsonPresenter();

    controller = new InvoiceController(
      mockServer as any,
      presenter,
      invoiceService,
    );

    controller.startup();
    app = mockServer.getApp();
  });

  beforeEach(() => {
    mockMediator.reset();
  });

  describe("POST /invoice", () => {
    test("Should generate invoices with valid request", async () => {
      const response = await request(app)
        .post("/invoice")
        .send({
          month: 1,
          year: 2022,
          type: "accrual",
        })
        .expect(200);

      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBe(true);
    });

    test("Should generate invoices with cash strategy", async () => {
      const response = await request(app)
        .post("/invoice")
        .send({
          month: 1,
          year: 2022,
          type: "cash",
        })
        .expect(200);

      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBe(true);
    });

    test("Should generate invoices with accrual strategy", async () => {
      const response = await request(app)
        .post("/invoice")
        .send({
          month: 6,
          year: 2022,
          type: "accrual",
        })
        .expect(200);

      expect(response.body).toBeDefined();
    });

    test("Should handle different months", async () => {
      for (let month = 1; month <= 12; month++) {
        const response = await request(app)
          .post("/invoice")
          .send({
            month,
            year: 2022,
            type: "accrual",
          })
          .expect(200);

        expect(response.body).toBeDefined();
      }
    });

    test("Should return JSON response", async () => {
      const response = await request(app)
        .post("/invoice")
        .send({
          month: 1,
          year: 2022,
          type: "accrual",
        })
        .expect(200)
        .expect("Content-Type", /json/);

      expect(response.body).toBeDefined();
    });

    test("Should publish event on successful generation", async () => {
      await request(app)
        .post("/invoice")
        .send({
          month: 1,
          year: 2022,
          type: "accrual",
        })
        .expect(200);

      const events = mockMediator.getPublishedEvents("INVOICE_GENERATED");
      expect(events.length).toBeGreaterThanOrEqual(1);
    });

    test("Should work with complete database data", async () => {
      mockDatabase.setMockData("contracts", [
        {
          id_contract: "e2e-contract-1",
          description: "E2E Test Service",
          amount: 12000,
          periods: 12,
          date: new Date("2022-01-01T10:00:00"),
        },
      ]);

      mockDatabase.setMockData("payments", [
        {
          id_payment: "e2e-payment-1",
          id_contract: "e2e-contract-1",
          amount: 1000,
          date: new Date("2022-01-15T10:00:00"),
        },
      ]);

      const response = await request(app)
        .post("/invoice")
        .send({
          month: 1,
          year: 2022,
          type: "cash",
        })
        .expect(200);

      expect(response.body).toBeDefined();
    });

    test("Should handle year boundaries", async () => {
      const response = await request(app)
        .post("/invoice")
        .send({
          month: 12,
          year: 2022,
          type: "accrual",
        })
        .expect(200);

      expect(response.body).toBeDefined();
    });

    test("Should process request with proper content type", async () => {
      const response = await request(app)
        .post("/invoice")
        .set("Content-Type", "application/json")
        .send({
          month: 3,
          year: 2022,
          type: "accrual",
        })
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });

  describe("Complete User Journey", () => {
    test("User can generate monthly invoices for their contracts", async () => {
      // Step 1: Setup test data
      mockDatabase.setMockData("contracts", [
        {
          id_contract: "user-contract-1",
          description: "Monthly subscription service",
          amount: 6000,
          periods: 12,
          date: new Date("2022-01-01T10:00:00"),
        },
      ]);

      // Step 2: User requests invoice generation
      const response = await request(app)
        .post("/invoice")
        .send({
          month: 1,
          year: 2022,
          type: "accrual",
        })
        .expect(200);

      // Step 3: Verify response
      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBe(true);

      // Step 4: Verify event was published
      const events = mockMediator.getPublishedEvents("INVOICE_GENERATED");
      expect(events.length).toBeGreaterThan(0);
    });

    test("User can generate invoices based on actual payments", async () => {
      // Setup: User has contract with payments
      mockDatabase.setMockData("contracts", [
        {
          id_contract: "cash-contract-1",
          description: "Pay as you go service",
          amount: 5000,
          periods: 5,
          date: new Date("2022-01-01T10:00:00"),
        },
      ]);

      mockDatabase.setMockData("payments", [
        {
          id_payment: "cash-payment-1",
          id_contract: "cash-contract-1",
          amount: 1000,
          date: new Date("2022-01-10T10:00:00"),
        },
        {
          id_payment: "cash-payment-2",
          id_contract: "cash-contract-1",
          amount: 1000,
          date: new Date("2022-01-20T10:00:00"),
        },
      ]);

      // Action: Generate cash basis invoices
      const response = await request(app)
        .post("/invoice")
        .send({
          month: 1,
          year: 2022,
          type: "cash",
        })
        .expect(200);

      // Verification
      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
