import { ContainerModule } from "inversify";
import { ZOD } from "../../../../@types/engine/validation/zod.type";
import { ENGINE_VALIDATION_REGISTRY } from "./validation.registry";
import { ZOD_ENGINE } from "./zod/zod.engine";

export const ENGINE_VALIDATION_MODULE = new ContainerModule(({ bind }) => {
  bind<ZOD>(ENGINE_VALIDATION_REGISTRY.ZOD).toConstantValue(ZOD_ENGINE);
});
