import { InvoiceGenerationStrategyDTO } from "../../../DTO/invoice/strategy/generation.dto";
import { Invoice } from "../../../entity/invoice.entity";
import { InvoiceGenerationStrategy } from "../invoice.interface";
import moment from "moment";

export class AccrualBasisStrategy implements InvoiceGenerationStrategy {
  generate({ contract, month, year }: InvoiceGenerationStrategyDTO): Invoice[] {
    const invoices = [];

    let period = 0;

    while (period <= contract.periods) {
      // Use UTC to avoid timezone issues
      const date = moment.utc(contract.date).add(period, "months");
      const dateMonth = date.month() + 1; // moment.month() returns 0-11, so +1 for 1-12
      const dateYear = date.year();

      period++;

      // Check if this period matches the requested month/year
      if (dateMonth === month && dateYear === year) {
        // Once we reach the requested month, stop
        break;
      }

      if (dateMonth > month || (dateMonth >= month && dateYear > year)) {
        // If we've passed the requested month, stop
        break;
      }

      // Only add invoices for periods BEFORE the requested month
      invoices.push(new Invoice(date.toDate(), contract.getAmountByPeriod()));
    }

    return invoices;
  }
}
