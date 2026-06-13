import { mockDeep } from "jest-mock-extended";
import { NativeSendInvoiceEmailUseCase } from "../../../../../../src/@modules/application/use-case/email/send/invoice.use-case";

export const mockNativeSendInvoiceEmailUseCase =
  mockDeep<NativeSendInvoiceEmailUseCase>();

export const simulateNativeSendInvoiceEmailUseCase = () => {
  return new NativeSendInvoiceEmailUseCase();
};
