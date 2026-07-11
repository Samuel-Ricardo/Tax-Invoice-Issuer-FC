import { Contract } from "../../../entity/contract.entity";

export interface InvoiceGenerationStrategyDTO {
  contract: Contract;
  month: number;
  year: number;
}
