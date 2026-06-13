import { ContainerModule } from "inversify";
import {
  mockContractRepositorySQL,
  simulateContractRepositorySQL,
} from "./sql/contract.repository";
import {
  mockPaymentRepositorySQL,
  simulatePaymentRepositorySQL,
} from "./sql/payment.repository";
import { TEST_REPOSITORY_REGISTRY } from "./repository.registry";
import { TEST_ENGINE_MODULE } from "../../infra/engine/engine.module";

export const TEST_REPOSITORY_MODULE = [
  ...TEST_ENGINE_MODULE,

  new ContainerModule((module) => {
    module
      .bind(TEST_REPOSITORY_REGISTRY.SQL.CONTRACT.MOCK)
      .toConstantValue(mockContractRepositorySQL);
    module
      .bind(TEST_REPOSITORY_REGISTRY.SQL.CONTRACT.SIMULATE)
      .toDynamicValue(simulateContractRepositorySQL);

    module
      .bind(TEST_REPOSITORY_REGISTRY.SQL.PAYMENT.MOCK)
      .toConstantValue(mockPaymentRepositorySQL);
    module
      .bind(TEST_REPOSITORY_REGISTRY.SQL.PAYMENT.SIMULATE)
      .toDynamicValue(simulatePaymentRepositorySQL);
  }),
];
