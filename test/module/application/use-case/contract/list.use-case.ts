import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { ListContractUseCaseImpl } from "../../../../../src/@modules/application/use-case/contract/list.use-case";
import { ResolutionContext } from "inversify";
import { TEST_MODULE } from "../../../app.registry";
import { ContractRepository } from "../../../../../src/@modules/domain/repository/contract.repository";
import { PaymentRepositorySQL } from "../../../../../src/@modules/application/repository/sql/payment.repository";

export const mockListContractUseCase = mockDeep<ListContractUseCaseImpl>();

export const simulateListContractUseCaseImpl = (module: ResolutionContext) => {
  const repository = {
    contract: module.get(
      TEST_MODULE.APPLICATION.REPOSITORY.SQL.CONTRACT.MOCK,
    ) as DeepMockProxy<ContractRepository>,
    payment: module.get(
      TEST_MODULE.APPLICATION.REPOSITORY.SQL.PAYMENT.MOCK,
    ) as DeepMockProxy<PaymentRepositorySQL>,
  };

  return {
    repository,
    use_case: new ListContractUseCaseImpl(
      repository.contract,
      repository.payment,
    ),
  };
};
