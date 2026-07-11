import { InvoiceStrategyType } from "../../../../@types/strategy/invoice.type";
import { AccrualBasisStrategy } from "./type/accrual.strategy";
import { CashBasisStrategy } from "./type/cash.strategy";

export class InvoiceGenerationStrategyFactory {
  static create(type: InvoiceStrategyType) {
    switch (type) {
      case "cash":
        return new CashBasisStrategy();
      case "accrual":
        return new AccrualBasisStrategy();
      default:
        throw new Error("Invalid strategy type");
    }
  }
}
