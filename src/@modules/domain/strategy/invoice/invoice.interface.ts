import { InvoiceGenerationStrategyDTO } from "../../DTO/invoice/strategy/generation.dto";
import { Invoice } from "../../entity/invoice.entity";

export interface InvoiceGenerationStrategy {
  generate(DTO: InvoiceGenerationStrategyDTO): Invoice[];
}
