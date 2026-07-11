import { ContainerModule } from "inversify";
import { TEST_ENGINE_VALIDATION_REGISTRY } from "./validation.registry";
import { MOCK_ZOD_ENGINE } from "./zod/zod.engine";

export const TEST_ENGINE_VALIDATION_MODULE = new ContainerModule(({ bind }) => {
  bind(TEST_ENGINE_VALIDATION_REGISTRY.ZOD).toConstantValue(MOCK_ZOD_ENGINE);
});
