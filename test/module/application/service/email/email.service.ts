import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { EmailServiceImpl } from "../../../../../src/@modules/application/service/email/email.service";
import { ResolutionContext } from "inversify";
import { TEST_MODULE } from "../../../app.registry";
import { SendInvoiceEmailUseCase } from "../../../../../src/@modules/domain/use-case/email/send/invoice.use-case";
import { SimulatedEmailService } from "../../../../@types/service/email/simulated.type";

export const mockEmailService = mockDeep<EmailServiceImpl>();

export const simulateEmailService = (
  module: ResolutionContext,
): SimulatedEmailService => {
  const use_case = module.get<DeepMockProxy<SendInvoiceEmailUseCase>>(
    TEST_MODULE.APPLICATION.USE_CASE.EMAIL.SEND.INVOICE.SIMULATE,
  );
  return {
    use_case,
    service: new EmailServiceImpl(use_case),
  };
};
