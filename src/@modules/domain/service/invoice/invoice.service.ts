import { InvoiceDTO } from "../../DTO/invoice.dto";
import { Invoice } from "../../entity/invoice.entity";

export interface InvoiceService {
  generate(DTO: InvoiceDTO): Promise<Invoice[]>;
}
