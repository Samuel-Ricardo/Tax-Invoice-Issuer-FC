import { TEST_CONFIG_MODULE } from "./config/config.module";
import { TEST_ENGINE_MODULE } from "./engine/engine.module";

export const TEST_INFRA_MODULE = [TEST_CONFIG_MODULE, ...TEST_ENGINE_MODULE];
