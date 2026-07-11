import { GenerateInvoiceDTO } from "../../DTO/invoice/generate.dto";
import { Invoice } from "../../entity/invoice.entity";

export interface GenerateInvoiceUseCase {
  execute(DTO: GenerateInvoiceDTO): Promise<Invoice[]>;
}
