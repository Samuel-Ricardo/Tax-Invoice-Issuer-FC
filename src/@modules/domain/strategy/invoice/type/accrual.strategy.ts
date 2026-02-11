import { InvoiceGenerationStrategyDTO } from "../../../DTO/invoice/strategy/generation.dto";
import { Invoice } from "../../../entity/invoice.entity";
import { InvoiceGenerationStrategy } from "../invoice.interface";
import moment from "moment";

export class AccrualBasisStrategy implements InvoiceGenerationStrategy {
  generate({ contract, month, year }: InvoiceGenerationStrategyDTO): Invoice[] {
    const invoices = [];

    let period = 0;

    while (period <= contract.periods) {
      const date = moment(contract.date).add(period++, "months").toDate();

      if (!this.isValid(date, month, year)) break;

      invoices.push(new Invoice(date, contract.getAmountByPeriod()));
    }

    return invoices;
  }

  private isValid(date: Date, month: number, year: number) {
    return date.getMonth() + 1 !== month || date.getFullYear() !== year;
  }
}
