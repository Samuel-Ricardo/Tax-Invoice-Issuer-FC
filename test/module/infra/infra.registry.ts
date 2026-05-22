import { TEST_CONFIG_REGISTRY } from "./config/config.registry";
import { TEST_ENGINE_REGISTRY } from "./engine/engine.registry";
import { TEST_HTTP_SERVER_REGISTRY } from "./server/http/http.registry";
import { TEST_VALIDATOR_REGISTRY } from "./validator/validator.registry";

export const TEST_INFRA_REGISTRY = {
  CONFIG: TEST_CONFIG_REGISTRY,
  ENGINE: TEST_ENGINE_REGISTRY,
  SERVER: TEST_HTTP_SERVER_REGISTRY,
  VALIDATION: TEST_VALIDATOR_REGISTRY,
};
