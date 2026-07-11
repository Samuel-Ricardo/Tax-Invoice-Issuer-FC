import { inject, injectable } from "inversify";
import { EmailService } from "../../../domain/service/email/email.service";
import { Invoice } from "../../../domain/entity/invoice.entity";
import { SendInvoiceEmailUseCase } from "../../../domain/use-case/email/send/invoice.use-case";
import { MODULE } from "../../../app.registry";

@injectable()
export class EmailServiceImpl implements EmailService {
  constructor(
    @inject(MODULE.APPLICATION.USE_CASE.EMAIL.SEND.INVOICE)
    private readonly mail: SendInvoiceEmailUseCase,
  ) {}

  async sendInvoices(invoices: Invoice[]) {
    await this.mail.execute(invoices);
  }
}
