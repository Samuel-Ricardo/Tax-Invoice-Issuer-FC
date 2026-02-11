import { ContainerModule } from "inversify";
import { Mediator } from "./mediator.interface";
import { MEDIATOR_REGISTRY } from "./mediator.registry";
import { NativeMediator } from "./native/native.mediator";

export const MEDIATOR_MODULE = new ContainerModule(({ bind }) => {
  bind<Mediator>(MEDIATOR_REGISTRY.NATIVE).to(NativeMediator);
});
