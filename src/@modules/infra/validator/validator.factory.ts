import { load, loads } from "../../../@utils/module/load.util";
import { Validator } from "../../domain/validator/validator.interface";
import { VALIDATOR_MODULE } from "./validator.module";
import { VALIDATOR_REGISTRY } from "./validator.registry";
import { ZodValidator } from "./zod/zod.validator";

const _MODULE = loads(VALIDATOR_MODULE);

export const VALIDATOR_FACTORY = {
  ZOD: () => _MODULE.get<ZodValidator<any>>(VALIDATOR_REGISTRY.ZOD),
};
