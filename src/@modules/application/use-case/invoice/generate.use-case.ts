import { injectable } from "inversify";
import { GenerateInvoiceUseCase } from "../../../domain/use-case/invoice/generate.use-case";
import { GenerateInvoiceDTO } from "../../../domain/DTO/invoice/generate.dto";
import { Invoice } from "../../../domain/entity/invoice.entity";

@injectable()
export class GenerateInvoiceUseCaseImpl implements GenerateInvoiceUseCase {
  constructor() {}
  execute(DTO: GenerateInvoiceDTO): Invoice {
    throw new Error("Method not implemented.");
  }
}
