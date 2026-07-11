import { ContainerModule } from "inversify";

import { TEST_MEDIATOR_REGISTRY } from "./mediator.registry";
import { MOCK_NATIVE_MEDIATOR } from "./native/native.mediator";

export const TEST_MEDIATOR_MODULE = new ContainerModule(({ bind }) => {
  bind(TEST_MEDIATOR_REGISTRY.NATIVE).toConstantValue(MOCK_NATIVE_MEDIATOR);
});
