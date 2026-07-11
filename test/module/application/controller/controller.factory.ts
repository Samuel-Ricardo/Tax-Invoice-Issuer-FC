import { DeepMockProxy } from "jest-mock-extended";
import { loads } from "../../../../src/@utils/module/load.util";
import { TEST_CONTROLLER_MODULE } from "./controller.module";
import { TEST_CONTROLLER_REGISTRY } from "./controller.registry";
import { EmailController } from "../../../../src/@modules/application/controller/email/email.controller";
import { SimulatedEmailController } from "../../../@types/controller/email/simulated.type";
import { InvoiceController } from "../../../../src/@modules/application/controller/invoice/invoice.controller";
import { SimulatedInvoiceController } from "../../../@types/controller/invoice/simulated.type";

const _MODULE = loads(TEST_CONTROLLER_MODULE);

export const TEST_CONTROLLER_FACTORY = {
  EMAIL: {
    MOCK: () =>
      _MODULE.get<DeepMockProxy<EmailController>>(
        TEST_CONTROLLER_REGISTRY.EMAIL.MOCK,
      ),
    SIMULATE: () =>
      _MODULE.get<SimulatedEmailController>(
        TEST_CONTROLLER_REGISTRY.EMAIL.SIMULATE,
      ),
  },

  INVOICE: {
    MOCK: () =>
      _MODULE.get<DeepMockProxy<InvoiceController>>(
        TEST_CONTROLLER_REGISTRY.INVOICE.MOCK,
      ),
    SIMULATE: () =>
      _MODULE.get<SimulatedInvoiceController>(
        TEST_CONTROLLER_REGISTRY.INVOICE.SIMULATE,
      ),
  },
};
