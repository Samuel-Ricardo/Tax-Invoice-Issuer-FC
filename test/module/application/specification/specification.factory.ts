import { Mock } from "node:test";
import { loads } from "../../../../src/@utils/module/load.util";
import { TEST_MODULE } from "../../app.registry";
import { TEST_SPECIFICATION_MODULE } from "./specification.module";
import { TEST_SPECIFICATION_REGISTRY } from "./specification.registry";
import { DeepMockProxy } from "jest-mock-extended";
import { EmailSpecificationZod } from "../../../../src/@modules/application/specificaiton/zod/email.specification";
import { InvoiceSpecificationZod } from "../../../../src/@modules/application/specificaiton/zod/invoice.specification";

const _MODULE = loads(TEST_SPECIFICATION_MODULE);

export const TEST_SPECIFICATION_FACTORY = {
  ZOD: {
    EMAIL: {
      MOCK: () =>
        _MODULE.get<DeepMockProxy<EmailSpecificationZod>>(
          TEST_SPECIFICATION_REGISTRY.ZOD.EMAIL.MOCK,
        ),
      SIMULATE: () =>
        _MODULE.get(TEST_SPECIFICATION_REGISTRY.ZOD.EMAIL.SIMULATE),
    },
    INVOICE: {
      MOCK: () =>
        _MODULE.get<DeepMockProxy<InvoiceSpecificationZod>>(
          TEST_SPECIFICATION_REGISTRY.ZOD.INVOICE.MOCK,
        ),
      SIMULATE: () =>
        _MODULE.get(TEST_SPECIFICATION_REGISTRY.ZOD.INVOICE.SIMULATE),
    },
  },
};
