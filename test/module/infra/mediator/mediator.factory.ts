import { DeepMockProxy } from "jest-mock-extended";
import { load } from "../../../../src/@utils/module/load.util";
import { MEDIATOR_MODULE } from "./mediator.module";
import { MEDIATOR_REGISTRY } from "./mediator.registry";

import { NativeMediator } from "../../../../src/@modules/infra/mediator/native/native.mediator";

const _MODULE = load(MEDIATOR_MODULE);

export const MEDIATOR_FACTORY = {
  NATIVE: () =>
    _MODULE.get<DeepMockProxy<NativeMediator>>(MEDIATOR_REGISTRY.NATIVE),
};
