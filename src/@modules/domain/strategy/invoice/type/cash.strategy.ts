import { InvoiceGenerationStrategyDTO } from "../../../DTO/invoice/strategy/generation.dto";
import { Invoice } from "../../../entity/invoice.entity";
import Payment from "../../../entity/payment.entity";
import { InvoiceGenerationStrategy } from "../invoice.interface";

export class CashBasisStrategy implements InvoiceGenerationStrategy {
  generate({ contract, month, year }: InvoiceGenerationStrategyDTO): Invoice[] {
    const invoices = contract.payments.flatMap((p) =>
      this.newInvoice(p, month, year),
    );

    console.log({ invoices });

    return invoices;
  }

  private newInvoice(payment: Payment, month: number, year: number) {
    if (this.isValid(payment, month, year))
      return new Invoice(payment.date, payment.amount);
    return null;
  }

  private isValid(payment: Payment, month: number, year: number) {
    return (
      payment.date.getMonth() + 1 !== month ||
      payment.date.getFullYear() !== year
    );
  }
}
