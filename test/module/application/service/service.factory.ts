import { DeepMockProxy } from "jest-mock-extended";
import { loads } from "../../../../src/@utils/module/load.util";
import { TEST_SERVICE_MODULE } from "./service.module";
import { TEST_SERVICE_REGISTRY } from "./service.registry";
import { EmailServiceImpl } from "../../../../src/@modules/application/service/email/email.service";
import { InvoiceServiceImpl } from "../../../../src/@modules/application/service/invoice/invoice.service";
import { SimulatedInvoiceService } from "../../../@types/service/invoice/simulated.type";
import { SimulatedEmailService } from "../../../@types/service/email/simulated.type";

const _MODULE = loads(TEST_SERVICE_MODULE);

export const TEST_SERVICE_FACTORY = {
  EMAIL: {
    MOCK: () =>
      _MODULE.get<DeepMockProxy<EmailServiceImpl>>(
        TEST_SERVICE_REGISTRY.EMAIL.MOCK,
      ),
    SIMULATE: () =>
      _MODULE.get<SimulatedEmailService>(TEST_SERVICE_REGISTRY.EMAIL.SIMULATE),
  },
  INVOICE: {
    MOCK: () =>
      _MODULE.get<InvoiceServiceImpl>(TEST_SERVICE_REGISTRY.INVOICE.MOCK),
    SIMULATE: () =>
      _MODULE.get<SimulatedInvoiceService>(
        TEST_SERVICE_REGISTRY.INVOICE.SIMULATE,
      ),
  },
};
