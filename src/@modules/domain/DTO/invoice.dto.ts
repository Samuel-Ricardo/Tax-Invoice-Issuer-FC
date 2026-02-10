import { InvoiceStrategyType } from "../../../@types/strategy/invoice.type";

export interface InvoiceDTO {
  month: number;
  year: number;
  type: InvoiceStrategyType;
  format?: string;
}
