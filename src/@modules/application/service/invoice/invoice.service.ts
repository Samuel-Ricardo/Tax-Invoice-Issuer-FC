import { inject, injectable } from "inversify";
import { Invoice } from "../../../domain/entity/invoice.entity";
import { InvoiceService } from "../../../domain/service/invoice/invoice.interface";
import { GenerateInvoiceDTO } from "../../../domain/DTO/invoice/generate.dto";
import { GenerateInvoiceUseCase } from "../../../domain/use-case/invoice/generate.interface";

@injectable()
export class InvoiceServiceImpl implements InvoiceService {
  constructor(
    ///@inject(MODULE)
    private readonly generateInvoice: GenerateInvoiceUseCase,
  ) {}

  async generate(DTO: GenerateInvoiceDTO): Promise<Invoice> {
    return this.generateInvoice.execute(DTO);
  }
}
