import { ContainerModule } from "inversify";
import { TEST_SPECIFICATION_REGISTRY } from "./specification.registry";
import {
  mockZodEmailSpeficiation,
  simulateEmailSpecificationZod,
} from "./zod/email.specification";
import {
  mockZodInvoiceSpeficiation,
  simulateInvoiceSpecificationZod,
} from "./zod/invoice.specification";
import { TEST_VALIDATOR_MODULE } from "../../infra/validator/validator.module";

export const TEST_SPECIFICATION_MODULE = [
  ...TEST_VALIDATOR_MODULE,
  new ContainerModule(({ bind }) => {
    bind(TEST_SPECIFICATION_REGISTRY.ZOD.EMAIL.MOCK).toConstantValue(
      mockZodEmailSpeficiation,
    );
    bind(TEST_SPECIFICATION_REGISTRY.ZOD.EMAIL.SIMULATE).toDynamicValue(
      simulateEmailSpecificationZod,
    );
    bind(TEST_SPECIFICATION_REGISTRY.ZOD.INVOICE.MOCK).toConstantValue(
      mockZodInvoiceSpeficiation,
    );
    bind(TEST_SPECIFICATION_REGISTRY.ZOD.INVOICE.SIMULATE).toDynamicValue(
      simulateInvoiceSpecificationZod,
    );
  }),
];
