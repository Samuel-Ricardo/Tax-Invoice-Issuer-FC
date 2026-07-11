import { Contract } from "../../entity/contract.entity";
import { InvoiceDTO } from "../invoice.dto";

export interface GenerateInvoiceDTO {
  contracts: Contract[];
  invoice: InvoiceDTO;
}
