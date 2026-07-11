import { inject, injectable } from "inversify";
import { GenerateInvoiceUseCase } from "../../../domain/use-case/invoice/generate.use-case";
import { GenerateInvoiceDTO } from "../../../domain/DTO/invoice/generate.dto";
import { MODULE } from "../../../app.registry";
import { Mediator } from "../../../infra/mediator/mediator.interface";

@injectable()
export class GenerateInvoiceUseCaseImpl implements GenerateInvoiceUseCase {
  constructor(
    @inject(MODULE.INFRA.MEDIATOR.NATIVE)
    private readonly mediator: Mediator,
    @inject(MODULE.INFRA.CONFIG.EVENT.INVOICE.GENERATED)
    private readonly INVOICE_GENERATED: string,
  ) {}

  async execute({ contracts, invoice }: GenerateInvoiceDTO) {
    const result = contracts.flatMap((c) => c.generateInvoices(invoice));

    await this.mediator.publish(this.INVOICE_GENERATED, result);

    return result;
  }
}
