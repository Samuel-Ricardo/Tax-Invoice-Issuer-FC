import { injectable } from "inversify";
import { ListContractUseCase } from "../../../domain/use-case/contract/list.use-case";
import { PaymentRepository } from "../../../domain/repository/payment.repository";
import { ContractRepository } from "../../../domain/repository/contract.repository";

import { Contract } from "../../../domain/entity/contract.entity";
import Payment from "../../../domain/entity/payment.entity";

@injectable()
export class ListContractUseCaseImpl implements ListContractUseCase {
  constructor(
    //    @inject(MODULE.APPLICATION.REPOSITORY)
    private readonly reposiotry: ContractRepository,
    //    @inject(MODULE.APPLICATION.REPOSITORY)
    private readonly payment: PaymentRepository,
  ) {}

  async execute() {
    return this.reposiotry.list().then(this.attachPayment);
  }

  private async attachPayment(contracts: Contract[]) {
    contracts.forEach((c) =>
      this.payment
        .list({ contrarId: c.idContract })
        .then((p) => this.addPayment(p, c)),
    );

    return contracts;
  }

  private async addPayment(payments: Payment[], contract: Contract) {
    payments.forEach((p) => contract.addPayment(p));
  }
}
