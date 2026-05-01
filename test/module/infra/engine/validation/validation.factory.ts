import { DeepMockProxy } from "jest-mock-extended";
import { load } from "../../../../../src/@utils/module/load.util";
import { TEST_ENGINE_VALIDATION_MODULE } from "./validation.module";
import { TEST_ENGINE_VALIDATION_REGISTRY } from "./validation.registry";
import { ZOD } from "../../../../../src/@types/engine/validation/zod.type";

const _MODULE = load(TEST_ENGINE_VALIDATION_MODULE);

export const TEST_ENGINE_VALIDATION_FACTORY = {
  ZOD: () =>
    _MODULE.get<DeepMockProxy<ZOD>>(TEST_ENGINE_VALIDATION_REGISTRY.ZOD),
};
