import { ContainerModule } from "inversify";
import { TEST_INFRA_MODULE } from "../../infra/infra.module";
import { TEST_SERVICE_MODULE } from "../service/service.module";
import { TEST_SPECIFICATION_MODULE } from "../specification/specification.module";
import { TEST_CONTROLLER_REGISTRY } from "./controller.registry";
import {
  mockNativeEmailController,
  simulateNativeEmailController,
} from "./email/email.controller";
import {
  mockInvoiceController,
  simulateInvoiceController,
} from "./invoice/invoice.controller";

export const TEST_CONTROLLER_MODULE = [
  ...TEST_INFRA_MODULE,
  ...TEST_SERVICE_MODULE,
  ...TEST_SPECIFICATION_MODULE,
  new ContainerModule((module) => {
    module
      .bind(TEST_CONTROLLER_REGISTRY.EMAIL.MOCK)
      .toConstantValue(mockNativeEmailController);
    module
      .bind(TEST_CONTROLLER_REGISTRY.EMAIL.SIMULATE)
      .toDynamicValue(simulateNativeEmailController);

    module
      .bind(TEST_CONTROLLER_REGISTRY.INVOICE.MOCK)
      .toConstantValue(mockInvoiceController);
    module
      .bind(TEST_CONTROLLER_REGISTRY.INVOICE.SIMULATE)
      .toDynamicValue(simulateInvoiceController);
  }),
];
