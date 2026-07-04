import { DeepMockProxy } from "jest-mock-extended";
import { GenerateInvoiceUseCaseImpl } from "../../../../src/@modules/application/use-case/invoice/generate.use-case";
import { NativeMediator } from "../../../../src/@modules/infra/mediator/native/native.mediator";

export interface SimulatedGenerateInvoiceUseCase {
  use_case: GenerateInvoiceUseCaseImpl;
  mediator: DeepMockProxy<NativeMediator>;
  INVOICE_GENERATED: DeepMockProxy<string>;
}
