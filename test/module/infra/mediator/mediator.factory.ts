import { DeepMockProxy } from "jest-mock-extended";
import { load } from "../../../../src/@utils/module/load.util";
import { TEST_MEDIATOR_MODULE } from "./mediator.module";
import { TEST_MEDIATOR_REGISTRY } from "./mediator.registry";

import { NativeMediator } from "../../../../src/@modules/infra/mediator/native/native.mediator";

const _MODULE = load(TEST_MEDIATOR_MODULE);

export const MEDIATOR_FACTORY = {
  NATIVE: () =>
    _MODULE.get<DeepMockProxy<NativeMediator>>(TEST_MEDIATOR_REGISTRY.NATIVE),
};
