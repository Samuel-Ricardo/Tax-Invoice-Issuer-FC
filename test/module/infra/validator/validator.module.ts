import { ContainerModule } from "inversify";
import { TEST_ENGINE_VALIDATION_MODULE } from "../engine/validation/validation.module";
import { TEST_VALIDATOR_REGISTRY } from "./validator.registry";
import { mockZodValidator } from "./zod/zod.validator";

export const TEST_VALIDATOR_MODULE = [
  TEST_ENGINE_VALIDATION_MODULE,
  new ContainerModule(({ bind }) => {
    bind(TEST_VALIDATOR_REGISTRY.ZOD.MOCK).toConstantValue(mockZodValidator);
    bind(TEST_VALIDATOR_REGISTRY.ZOD.SIMULATE).toDynamicValue((a) => a);
  }),
];
