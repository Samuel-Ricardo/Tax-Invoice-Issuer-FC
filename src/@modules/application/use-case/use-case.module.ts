import { ContainerModule } from "inversify";
import { USE_CASE_REGISTRY } from "./use-case.registry";

import { GenerateInvoiceUseCaseImpl } from "./invoice/generate.use-case";
import { ListContractUseCaseImpl } from "./contract/list.use-case";
import { INFRA_MODULE } from "../../infra/infra.module";
import { REPOSITORY_MODULE } from "../repository/repository.module";

export const USE_CASE_MODULE = [
  ...INFRA_MODULE,
  ...REPOSITORY_MODULE,
  new ContainerModule(({ bind }) => {
    bind(USE_CASE_REGISTRY.INVOICE.GENERATE).to(GenerateInvoiceUseCaseImpl);
    bind(USE_CASE_REGISTRY.CONTRACT.LIST).to(ListContractUseCaseImpl);
    bind(USE_CASE_REGISTRY.EMAIL.SEND.INVOICE).to(GenerateInvoiceUseCaseImpl);
  }),
];
