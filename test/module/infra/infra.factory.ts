import { TEST_CONFIG_FACTORY } from "./config/config.factory";
import { TEST_ENGINE_FACTORY } from "./engine/engine.factory";

export const TEST_INFRA_FACTORY = {
  CONFIG: TEST_CONFIG_FACTORY,
  ENGINE: TEST_ENGINE_FACTORY,
};
