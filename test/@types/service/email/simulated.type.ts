import { DeepMockProxy } from "jest-mock-extended";
import { EmailServiceImpl } from "../../../../src/@modules/application/service/email/email.service";
import { SendInvoiceEmailUseCase } from "../../../../src/@modules/domain/use-case/email/send/invoice.use-case";

export interface SimulatedEmailService {
  use_case: DeepMockProxy<SendInvoiceEmailUseCase>;
  service: EmailServiceImpl;
}
