import { Invoice } from "../../entity/invoice.entity";

export interface EmailService {
  sendInvoices(data: Invoice[]): Promise<void>;
}
