import { inject, injectable } from "inversify";
import { Invoice } from "../../../domain/entity/invoice.entity";
import { InvoiceService } from "../../../domain/service/invoice/invoice.service";
import { GenerateInvoiceUseCase } from "../../../domain/use-case/invoice/generate.use-case";
import { ListContractUseCase } from "../../../domain/use-case/contract/list.use-case";
import { InvoiceDTO } from "../../../domain/DTO/invoice.dto";
import { MODULE } from "../../../app.registry";

@injectable()
export class InvoiceServiceImpl implements InvoiceService {
  constructor(
    @inject(MODULE.APPLICATION.USE_CASE.INVOICE.GENERATE)
    private readonly generateInvoice: GenerateInvoiceUseCase,
    @inject(MODULE.APPLICATION.USE_CASE.CONTRACT.LIST)
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
