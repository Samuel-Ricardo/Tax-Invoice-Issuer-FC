import { ContainerModule } from "inversify";
import { TEST_USE_CASE_REGISTRY } from "./use-case.registry";
import {
  mockListContractUseCase,
  simulateListContractUseCaseImpl,
} from "./contract/list.use-case";
import {
  mockGenerateInvoiceUseCase,
  simulateGenerateInvoiceUseCaseImpl,
} from "./invoice/generate.use-case";
import { simulateNativeSendInvoiceEmailUseCase } from "./email/send/invoice.use-case";
import { TEST_REPOSITORY_MODULE } from "../repository/repository.module";
import { TEST_INFRA_MODULE } from "../../infra/infra.module";

export const TEST_USE_CASE_MODULE = [
  ...TEST_INFRA_MODULE,
  ...TEST_REPOSITORY_MODULE,
  new ContainerModule((module) => {
    module
      .bind(TEST_USE_CASE_REGISTRY.CONTRACT.LIST.MOCK)
      .toConstantValue(mockListContractUseCase);
    module
      .bind(TEST_USE_CASE_REGISTRY.CONTRACT.LIST.SIMULATE)
      .toDynamicValue(simulateListContractUseCaseImpl);

    module
      .bind(TEST_USE_CASE_REGISTRY.INVOICE.MOCK)
      .toConstantValue(mockGenerateInvoiceUseCase);
    module
      .bind(TEST_USE_CASE_REGISTRY.INVOICE.SIMULATE)
      .toDynamicValue(simulateGenerateInvoiceUseCaseImpl);

    module
      .bind(TEST_USE_CASE_REGISTRY.EMAIL.SEND.INVOICE.MOCK)
      .toConstantValue(mockListContractUseCase);
    module
      .bind(TEST_USE_CASE_REGISTRY.EMAIL.SEND.INVOICE.SIMULATE)
      .toDynamicValue(simulateNativeSendInvoiceEmailUseCase);
  }),
];
