import { injectable } from "inversify";
import { Invoice } from "../../../../domain/entity/invoice.entity";
import { SendInvoiceEmailUseCase } from "../../../../domain/use-case/email/send/invoice.use-case";

@injectable()
export class NativeSendInvoiceEmailUseCase implements SendInvoiceEmailUseCase {
  async execute(invoices: Invoice[]) {
    console.log("Sending Mail", { invoices });
  }
}
