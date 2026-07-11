import { loads } from "../../../@utils/module/load.util";
import { ContractRepository } from "../../domain/repository/contract.repository";
import { PaymentRepository } from "../../domain/repository/payment.repository";
import { REPOSITORY_MODULE } from "./repository.module";
import { REPOSITORY_REGISTRY } from "./repository.registry";

const _MODULE = loads(REPOSITORY_MODULE);

export const REPOSITORY_FACTORY = {
  SQL: {
    CONTRACT: () =>
      _MODULE.get<ContractRepository>(REPOSITORY_REGISTRY.SQL.CONTRACT),
    PAYMENT: () =>
      _MODULE.get<PaymentRepository>(REPOSITORY_REGISTRY.SQL.PAYMENT),
  },
};
