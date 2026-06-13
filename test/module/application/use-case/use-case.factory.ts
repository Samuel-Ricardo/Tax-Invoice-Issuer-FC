import { loads } from "../../../../src/@utils/module/load.util";
import { TEST_USE_CASE_MODULE } from "./use-case.module";
import { TEST_USE_CASE_REGISTRY } from "./use-case.registry";

const _MODULE = loads(TEST_USE_CASE_MODULE);

export const TEST_USE_CASE_FACTORY = {
  CONTRACT: {
    LIST: {
      MOCK: () => _MODULE.get(TEST_USE_CASE_REGISTRY.CONTRACT.LIST.MOCK),
      SIMULATE: () =>
        _MODULE.get(TEST_USE_CASE_REGISTRY.CONTRACT.LIST.SIMULATE),
    },
  },
  EMAIL: {
    SEND: {
      INVOICE: {
        MOCK: () => _MODULE.get(TEST_USE_CASE_REGISTRY.EMAIL.SEND.INVOICE.MOCK),
        SIMULATE: () =>
          _MODULE.get(TEST_USE_CASE_REGISTRY.EMAIL.SEND.INVOICE.SIMULATE),
      },
    },
  },
  INVOICE: {
    MOCK: () => _MODULE.get(TEST_USE_CASE_REGISTRY.INVOICE.MOCK),
    SIMULATE: () => _MODULE.get(TEST_USE_CASE_REGISTRY.INVOICE.SIMULATE),
  },
};
