import { ContainerModule } from "inversify";
import { SPECIFICATION_REGISTRY } from "./specification.registry";
import { InvoiceSpecificationZod } from "./zod/invoice.specification";
import { VALIDATOR_MODULE } from "../../infra/validator/validator.module";

export const SPECIFICATION_MODULE = [
  ...VALIDATOR_MODULE,
  new ContainerModule(({ bind }) => {
    bind(SPECIFICATION_REGISTRY.INVOICE).to(InvoiceSpecificationZod);
  }),
];
