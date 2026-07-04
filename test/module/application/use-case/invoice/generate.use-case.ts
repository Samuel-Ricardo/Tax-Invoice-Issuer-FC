import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { GenerateInvoiceUseCaseImpl } from "../../../../../src/@modules/application/use-case/invoice/generate.use-case";
import { ResolutionContext } from "inversify";
import { NativeMediator } from "../../../../../src/@modules/infra/mediator/native/native.mediator";
import { TEST_MODULE } from "../../../app.registry";
import { SimulatedGenerateInvoiceUseCase } from "../../../../@types/use-case/invoice/simulated.type";

export const mockGenerateInvoiceUseCase =
  mockDeep<GenerateInvoiceUseCaseImpl>();

export const simulateGenerateInvoiceUseCaseImpl = (
  module: ResolutionContext,
): SimulatedGenerateInvoiceUseCase => {
  const mediator = module.get<DeepMockProxy<NativeMediator>>(
    TEST_MODULE.INFRA.MEDIATOR.NATIVE,
  );

  const INVOICE_GENERATED = module.get<DeepMockProxy<string>>(
    TEST_MODULE.INFRA.CONFIG.EVENT.INVOICE.GENERATED,
  );

  return {
    mediator,
    INVOICE_GENERATED,
    use_case: new GenerateInvoiceUseCaseImpl(mediator, INVOICE_GENERATED),
  };
};
