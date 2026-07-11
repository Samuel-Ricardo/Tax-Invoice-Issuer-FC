/**
 * CONTAINER HELPER - Facilita criação de containers para testes
 *
 * Este helper permite criar containers de teste com estratégias
 * para sobrescrever implementações reais por mocks.
 */

import { ContainerModule } from "inversify";
import {
  loadsWithRebind,
  loadsWithSkip,
} from "../../src/@utils/module/load.util";
import { INFRA_MODULE } from "../../src/@modules/infra/infra.module";
import { SERVICE_MODULE } from "../../src/@modules/application/service/service.module";
import { CONTROLLER_MODULE } from "../../src/@modules/application/controller/controller.module";

/**
 * Cria container para testes com possibilidade de sobrescrever bindings
 *
 * @example
 * ```typescript
 * // test/integration/invoice.spec.ts
 * describe("Invoice Integration", () => {
 *   let container: Container;
 *
 *   beforeEach(() => {
 *     const mockDatabase = new ContainerModule(({ bind }) => {
 *       bind("Database").toConstantValue(new MockDatabase());
 *     });
 *
 *     container = createTestContainer([mockDatabase]);
 *   });
 *
 *   it("should create invoice", () => {
 *     const invoiceService = container.get("InvoiceService");
 *     // ... teste usando mock database
 *   });
 * });
 * ```
 */
export const createTestContainer = (mockModules: ContainerModule[] = []) => {
  return loadsWithRebind([
    ...INFRA_MODULE,
    ...SERVICE_MODULE,
    ...CONTROLLER_MODULE,
    ...mockModules, // ✅ Mocks sobrescrevem implementações reais
  ]);
};

/**
 * Cria container com módulos protegidos (não podem ser sobrescritos)
 *
 * Útil quando você quer garantir que módulos core não sejam substituídos,
 * mas ainda permite adicionar novos bindings.
 *
 * @example
 * ```typescript
 * const container = createProtectedContainer([
 *   CORE_MODULES,  // ✅ Protegidos
 *   PLUGIN_MODULE, // Se tentar sobrescrever core → ignorado
 * ]);
 * ```
 */
export const createProtectedContainer = (modules: ContainerModule[]) => {
  return loadsWithSkip(modules);
};

// ============================================================================
// EXEMPLOS DE MOCKS COMUNS
// ============================================================================

/**
 * Mock de Database para testes
 */
export const MOCK_DATABASE_MODULE = new ContainerModule(({ bind }) => {
  bind("Database").toConstantValue({
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    query: jest.fn().mockResolvedValue([]),
  });
});

/**
 * Mock de Logger para testes (silencioso)
 */
export const MOCK_LOGGER_MODULE = new ContainerModule(({ bind }) => {
  bind("Logger").toConstantValue({
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  });
});

/**
 * Mock de EmailService para testes
 */
export const MOCK_EMAIL_MODULE = new ContainerModule(({ bind }) => {
  bind("EmailService").toConstantValue({
    send: jest.fn().mockResolvedValue({ success: true }),
  });
});

/**
 * Mock de PaymentService para testes
 */
export const MOCK_PAYMENT_MODULE = new ContainerModule(({ bind }) => {
  bind("PaymentService").toConstantValue({
    charge: jest.fn().mockResolvedValue({ transactionId: "mock-123" }),
    refund: jest.fn().mockResolvedValue({ success: true }),
  });
});

// ============================================================================
// HELPERS ESPECÍFICOS PARA O PROJETO
// ============================================================================

/**
 * Cria container completo para testes de integração
 * Substitui serviços externos por mocks, mas mantém lógica de negócio
 */
export const createIntegrationTestContainer = () => {
  return createTestContainer([
    MOCK_DATABASE_MODULE,
    MOCK_LOGGER_MODULE,
    MOCK_EMAIL_MODULE,
  ]);
};

/**
 * Cria container para testes unitários (tudo mockado)
 */
export const createUnitTestContainer = (
  customMocks: ContainerModule[] = [],
) => {
  return createTestContainer([
    MOCK_DATABASE_MODULE,
    MOCK_LOGGER_MODULE,
    MOCK_EMAIL_MODULE,
    MOCK_PAYMENT_MODULE,
    ...customMocks,
  ]);
};

/**
 * Cria container para testes E2E (mínimo de mocks)
 */
export const createE2ETestContainer = () => {
  // Em E2E, geralmente queremos comportamento real
  // Apenas mockamos serviços externos que não podemos controlar
  return createTestContainer([
    MOCK_EMAIL_MODULE, // Mock: email externo
    MOCK_PAYMENT_MODULE, // Mock: gateway de pagamento externo
    // Database e outros permanecem reais para E2E
  ]);
};

// ============================================================================
// EXEMPLO DE USO EM TESTE
// ============================================================================

/**
 * Exemplo de uso em teste:
 *
 * ```typescript
 * // test/integration/invoice/invoice.spec.ts
 * import { createTestContainer, MOCK_DATABASE_MODULE } from "../../helpers/container.helper";
 *
 * describe("Invoice Service", () => {
 *   let container: Container;
 *   let invoiceService: InvoiceService;
 *
 *   beforeEach(() => {
 *     // Cria container com mocks
 *     container = createTestContainer([MOCK_DATABASE_MODULE]);
 *     invoiceService = container.get("InvoiceService");
 *   });
 *
 *   it("should create invoice", async () => {
 *     const invoice = await invoiceService.create({
 *       customerId: "123",
 *       amount: 100,
 *     });
 *
 *     expect(invoice.id).toBeDefined();
 *   });
 *
 *   it("should save to database", async () => {
 *     const database = container.get("Database");
 *
 *     await invoiceService.create({ customerId: "123", amount: 100 });
 *
 *     expect(database.query).toHaveBeenCalledWith(
 *       expect.stringContaining("INSERT INTO invoices")
 *     );
 *   });
 * });
 * ```
 */
