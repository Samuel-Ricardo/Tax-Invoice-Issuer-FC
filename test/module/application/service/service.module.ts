import { ContainerModule } from "inversify";
import { TEST_SERVICE_REGISTRY } from "./service.registry";
import { mockEmailService, simulateEmailService } from "./email/email.service";
import {
  mockInvoiceService,
  simulateInvoiceService,
} from "./invoice/invoice.service";
import { TEST_USE_CASE_MODULE } from "../use-case/use-case.module";

export const TEST_SERVICE_MODULE = [
  ...TEST_USE_CASE_MODULE,
  new ContainerModule(({ bind }) => {
    bind(TEST_SERVICE_REGISTRY.EMAIL.MOCK).toConstantValue(mockEmailService);
    bind(TEST_SERVICE_REGISTRY.EMAIL.SIMULATE).toDynamicValue(
      simulateEmailService,
    );

    bind(TEST_SERVICE_REGISTRY.INVOICE.MOCK).toConstantValue(
      mockInvoiceService,
    );
    bind(TEST_SERVICE_REGISTRY.INVOICE.SIMULATE).toDynamicValue(
      simulateInvoiceService,
    );
  }),
];
