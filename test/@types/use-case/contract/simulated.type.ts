import { DeepMockProxy } from "jest-mock-extended";
import { ListContractUseCaseImpl } from "../../../../src/@modules/application/use-case/contract/list.use-case";
import { ContractRepository } from "../../../../src/@modules/domain/repository/contract.repository";
import { PaymentRepositorySQL } from "../../../../src/@modules/application/repository/sql/payment.repository";

export interface SimulatedListContractUseCase {
  use_case: ListContractUseCaseImpl;
  repository: {
    contract: DeepMockProxy<ContractRepository>;
    payment: DeepMockProxy<PaymentRepositorySQL>;
  };
}
