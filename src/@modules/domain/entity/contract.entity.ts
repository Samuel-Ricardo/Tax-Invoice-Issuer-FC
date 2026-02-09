import Payment from "./payment.entity";

export class Contract {
  readonly payments: Payment[];

  constructor(
    readonly idContract: string,
    readonly description: string,
    readonly amounts: number,
    readonly periods: Date,
    readonly date: Date,
  ) {
    this.payments = [];
  }

  addPayment(payment: Payment) {
    this.payments.push(payment);
  }

  getBalance() {
    let balance = this.amounts;
    this.payments.forEach((p) => (balance -= p.amount));
    return balance;
  }
}
