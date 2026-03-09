import { injectable } from "inversify";
import { Invoice } from "../../../../domain/entity/invoice.entity";
import { SendInvoiceEmailUseCase } from "../../../../domain/use-case/email/send/invoice.use-case";
//import { DataLogger } from "../../../../../@decorators/log/data.decorator";

@injectable()
export class NativeSendInvoiceEmailUseCase implements SendInvoiceEmailUseCase {
  //@DataLogger({ context: "USE_CASE", message: "SEND INVOICE [EMAIL]" })
  async execute(invoices: Invoice[]) {
    console.log("Sending Mail", { invoices });
  }
}
