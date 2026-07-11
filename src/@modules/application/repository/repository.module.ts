import { ContainerModule } from "inversify";
import { REPOSITORY_REGISTRY } from "./repository.registry";
import { ContractRepositorySQL } from "./sql/contract.repository";
import { PaymentRepositorySQL } from "./sql/payment.repository";
import { INFRA_MODULE } from "../../infra/infra.module";

export const REPOSITORY_MODULE = [
  ...INFRA_MODULE,
  new ContainerModule(({ bind }) => {
    bind(REPOSITORY_REGISTRY.SQL.CONTRACT).to(ContractRepositorySQL);
    bind(REPOSITORY_REGISTRY.SQL.PAYMENT).to(PaymentRepositorySQL);
  }),
];
