import { loads } from "../../../../src/@utils/module/load.util";
import { TEST_VALIDATOR_MODULE } from "./validator.module";
import { TEST_VALIDATOR_REGISTRY } from "./validator.registry";

const _MODULE = loads(TEST_VALIDATOR_MODULE);

export const TEST_VALIDATOR_FACTORY = {
  ZOD: {
    MOCK: () => _MODULE.get(TEST_VALIDATOR_REGISTRY.ZOD.MOCK),
    SIMULATE: () => _MODULE.get(TEST_VALIDATOR_REGISTRY.ZOD.SIMULATE),
  },
};
