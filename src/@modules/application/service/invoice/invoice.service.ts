import { inject, injectable } from "inversify";
import { Invoice } from "../../../domain/entity/invoice.entity";
import { InvoiceService } from "../../../domain/service/invoice/invoice.service";
import { GenerateInvoiceDTO } from "../../../domain/DTO/invoice/generate.dto";
import { GenerateInvoiceUseCase } from "../../../domain/use-case/invoice/generate.use-case";
import { ListContractUseCase } from "../../../domain/use-case/contract/list.use-case";
import { InvoiceDTO } from "../../../domain/DTO/invoice.dto";

@injectable()
export class InvoiceServiceImpl implements InvoiceService {
  constructor(
    ///@inject(MODULE)
    private readonly generateInvoice: GenerateInvoiceUseCase,
    private readonly listContract: ListContractUseCase,
  ) {}

  async generate(invoice: InvoiceDTO): Promise<Invoice[]> {
    return this.listContract
      .execute()
      .then((contracts) =>
        this.generateInvoice.execute({ contracts, invoice }),
      );
  }
}
