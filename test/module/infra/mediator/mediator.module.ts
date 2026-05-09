import { ContainerModule } from "inversify";

import { MEDIATOR_REGISTRY } from "./mediator.registry";
import { MOCK_NATIVE_MEDIATOR } from "./native/native.mediator";

export const MEDIATOR_MODULE = new ContainerModule(({ bind }) => {
  bind(MEDIATOR_REGISTRY.NATIVE).toConstantValue(MOCK_NATIVE_MEDIATOR);
});
