import { DeepMockProxy } from "jest-mock-extended";
import { NativeSendInvoiceEmailUseCase } from "../../../../src/@modules/application/use-case/email/send/invoice.use-case";

export type SimulatedSendInvoiceEmailUseCase =
  DeepMockProxy<NativeSendInvoiceEmailUseCase>;
