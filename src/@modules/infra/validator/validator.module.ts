import { ContainerModule } from "inversify";
import { VALIDATOR_REGISTRY } from "./validator.registry";
import { ZodValidator } from "./zod/zod.validator";
import { ENGINE_MODULE } from "../engine/engine.module";

export const VALIDATOR_MODULE = [
  ...ENGINE_MODULE,
  new ContainerModule(({ bind }) => {
    bind(VALIDATOR_REGISTRY.ZOD).toConstantValue(ZodValidator);
  }),
];
