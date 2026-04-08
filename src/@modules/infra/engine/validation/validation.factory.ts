import { ZOD } from "../../../../@types/engine/validation/zod.type";
import { load } from "../../../../@utils/module/load.util";
import { ENGINE_VALIDATION_MODULE } from "./validation.module";
import { ENGINE_VALIDATION_REGISTRY } from "./validation.registry";

const _MODULE = load(ENGINE_VALIDATION_MODULE);

export const ENGINE_VALIDATION_FACTORY = {
  ZOD: () => _MODULE.get<ZOD>(ENGINE_VALIDATION_REGISTRY.ZOD),
};
