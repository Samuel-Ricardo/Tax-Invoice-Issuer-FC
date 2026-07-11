import "reflect-metadata";
import { MEDIATOR_FACTORY } from "../../../src/@modules/infra/mediator/mediator.factory";
import { PRESENTER_FACTORY } from "../../../src/@modules/infra/presenter/presenter.factory";
import { VALIDATOR_FACTORY } from "../../../src/@modules/infra/validator/validator.factory";
import { CONFIG_FACTORY } from "../../../src/@modules/infra/config/config.factory";
import { SERVICE_FACTORY } from "../../../src/@modules/application/service/service.factory";
import { SPECIFICATION_FACTORY } from "../../../src/@modules/application/specificaiton/specification.factory";
import { USE_CASE_FACTORY } from "../../../src/@modules/application/use-case/use-case.factory";

/**
 * Integration tests for production factories.
 * These factories use the real DI containers with actual implementations.
 */
describe("[FACTORIES] - [INFRASTRUCTURE]", () => {
  // ============================================================================
  // MEDIATOR FACTORY
  // ============================================================================

  it("[UNIT] | [FACTORY] - MEDIATOR.NATIVE > returns a Mediator instance", () => {
    const mediator = MEDIATOR_FACTORY.NATIVE();
    expect(mediator).toBeDefined();
    expect(typeof mediator.on).toBe("function");
    expect(typeof mediator.publish).toBe("function");
  });

  // ============================================================================
  // PRESENTER FACTORY
  // ============================================================================

  it("[UNIT] | [FACTORY] - PRESENTER.JSON > returns a JSON Presenter instance", () => {
    const presenter = PRESENTER_FACTORY.JSON();
    expect(presenter).toBeDefined();
    expect(typeof presenter.present).toBe("function");
  });

  // ============================================================================
  // VALIDATOR FACTORY
  // ============================================================================

  it("[UNIT] | [FACTORY] - VALIDATOR.ZOD > returns a ZodValidator instance", () => {
    const validator = VALIDATOR_FACTORY.ZOD();
    expect(validator).toBeDefined();
    expect(typeof validator.validate).toBe("function");
    expect(typeof validator.validateAsync).toBe("function");
  });

  // ============================================================================
  // CONFIG FACTORY
  // ============================================================================

  it("[UNIT] | [FACTORY] - CONFIG.ENV.IRONMENT > returns environment config object", () => {
    const env = CONFIG_FACTORY.ENV.IRONMENT();
    expect(env).toBeDefined();
  });

  it("[UNIT] | [FACTORY] - CONFIG.ENV.DATABASE.URL > returns database URL string", () => {
    const url = CONFIG_FACTORY.ENV.DATABASE.URL();
    expect(typeof url).toBe("string");
  });

  it("[UNIT] | [FACTORY] - CONFIG.EVENT.S > returns events config", () => {
    const events = CONFIG_FACTORY.EVENT.S();
    expect(events).toBeDefined();
  });

  it("[UNIT] | [FACTORY] - CONFIG.EVENT.INVOICE.GENERATED > returns event name string", () => {
    const eventName = CONFIG_FACTORY.EVENT.INVOICE.GENERATED();
    expect(typeof eventName).toBe("string");
  });

  // ============================================================================
  // SERVICE FACTORY
  // ============================================================================

  it("[UNIT] | [FACTORY] - SERVICE.INVOICE > returns an InvoiceService instance", () => {
    const service = SERVICE_FACTORY.INVOICE();
    expect(service).toBeDefined();
    expect(typeof service.generate).toBe("function");
  });

  it("[UNIT] | [FACTORY] - SERVICE.EMAIL > returns an EmailService instance", () => {
    const service = SERVICE_FACTORY.EMAIL();
    expect(service).toBeDefined();
    expect(typeof service.sendInvoices).toBe("function");
  });

  // ============================================================================
  // SPECIFICATION FACTORY
  // ============================================================================

  it("[UNIT] | [FACTORY] - SPECIFICATION.ZOD.INVOICE > returns an InvoiceSpecification instance", () => {
    const spec = SPECIFICATION_FACTORY.ZOD.INVOICE();
    expect(spec).toBeDefined();
    expect(typeof spec.isSatisfiedBy).toBe("function");
  });

  it("[UNIT] | [FACTORY] - SPECIFICATION.ZOD.EMAIL > returns an EmailSpecification instance", () => {
    const spec = SPECIFICATION_FACTORY.ZOD.EMAIL();
    expect(spec).toBeDefined();
    expect(typeof spec.isSatisfiedBy).toBe("function");
  });

  // ============================================================================
  // USE-CASE FACTORY
  // ============================================================================

  it("[UNIT] | [FACTORY] - USE_CASE.INVOICE.GENERATE > returns a GenerateInvoiceUseCase", () => {
    const useCase = USE_CASE_FACTORY.INVOICE.GENERATE();
    expect(useCase).toBeDefined();
    expect(typeof useCase.execute).toBe("function");
  });

  it("[UNIT] | [FACTORY] - USE_CASE.CONTRACT.LIST > returns a ListContractUseCase", () => {
    const useCase = USE_CASE_FACTORY.CONTRACT.LIST();
    expect(useCase).toBeDefined();
    expect(typeof useCase.execute).toBe("function");
  });

  it("[UNIT] | [FACTORY] - USE_CASE.EMAIL.SEND.INVOICE > returns a SendInvoiceEmailUseCase", () => {
    const useCase = USE_CASE_FACTORY.EMAIL.SEND.INVOICE();
    expect(useCase).toBeDefined();
    expect(typeof useCase.execute).toBe("function");
  });
});
