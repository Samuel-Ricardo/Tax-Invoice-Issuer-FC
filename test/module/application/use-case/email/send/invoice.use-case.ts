import { mockDeep } from "jest-mock-extended";
import { NativeSendInvoiceEmailUseCase } from "../../../../../../src/@modules/application/use-case/email/send/invoice.use-case";
import { SimulatedSendInvoiceEmailUseCase } from "../../../../../@types/use-case/email/simulated.type";

export const mockNativeSendInvoiceEmailUseCase =
  mockDeep<NativeSendInvoiceEmailUseCase>();

export const simulateNativeSendInvoiceEmailUseCase =
  (): SimulatedSendInvoiceEmailUseCase => {
    return mockDeep<NativeSendInvoiceEmailUseCase>();
  };
