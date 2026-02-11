import { InvoiceDTO } from "../DTO/invoice.dto";
import { InvoiceGenerationStrategyFactory } from "../strategy/invoice/invoice.strategy";
import { Invoice } from "./invoice.entity";
import Payment from "./payment.entity";

export class Contract {
  readonly payments: Payment[];

  constructor(
    readonly idContract: string,
    readonly description: string,
    readonly amount: number,
    readonly periods: number,
    readonly date: Date,
  ) {
    this.payments = [];
  }

  addPayment(payment: Payment) {
    this.payments.push(payment);
  }

  getBalance() {
    let balance = this.amount;
    this.payments.forEach((p) => (balance -= p.amount));
    return balance;
  }

  getAmountByPeriod() {
    return this.amount / this.periods;
  }

  generateInvoices({ month, year, type }: InvoiceDTO): Invoice[] {
    return InvoiceGenerationStrategyFactory.create(type).generate({
      contract: this,
      month,
      year,
    });
  }
}
