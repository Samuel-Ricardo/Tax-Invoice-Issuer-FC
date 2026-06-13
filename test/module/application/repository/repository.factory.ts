import { loads } from "../../../../src/@utils/module/load.util";
import { TEST_REPOSITORY_MODULE } from "./repository.module";
import { TEST_REPOSITORY_REGISTRY } from "./repository.registry";

const _MODULE = loads(TEST_REPOSITORY_MODULE);

export const TEST_REPOSITORY_FACTORY = {
  SQL: {
    CONTRACT: {
      MOCK: () => _MODULE.get(TEST_REPOSITORY_REGISTRY.SQL.CONTRACT.MOCK),
      SIMULATE: () =>
        _MODULE.get(TEST_REPOSITORY_REGISTRY.SQL.CONTRACT.SIMULATE),
    },
    PAYMENT: {
      MOCK: () => _MODULE.get(TEST_REPOSITORY_REGISTRY.SQL.PAYMENT.MOCK),
      SIMULATE: () =>
        _MODULE.get(TEST_REPOSITORY_REGISTRY.SQL.PAYMENT.SIMULATE),
    },
  },
};
