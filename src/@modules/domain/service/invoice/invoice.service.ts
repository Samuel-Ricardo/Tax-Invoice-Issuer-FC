import { InvoiceDTO } from "../../DTO/invoice.dto";
import { GenerateInvoiceDTO } from "../../DTO/invoice/generate.dto";
import { Invoice } from "../../entity/invoice.entity";

export interface InvoiceService {
  generate(DTO: InvoiceDTO): Promise<Invoice[]>;
}
