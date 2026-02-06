import { GenerateInvoiceDTO } from "../../../domain/DTO/invoice/generate.dto";
import { Invoice } from "../../../domain/entity/invoice.entity";

export interface InvoiceService {
  generate(DTO: GenerateInvoiceDTO): Promise<Invoice>;
}
