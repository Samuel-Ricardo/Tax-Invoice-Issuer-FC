import { Invoice } from "../../../entity/invoice.entity";

export interface SendInvoiceEmailUseCase {
  execute(data: Invoice[]): Promise<void>;
}
