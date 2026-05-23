import { TEST_CONFIG_MODULE } from "./config/config.module";
import { TEST_ENGINE_MODULE } from "./engine/engine.module";
import { TEST_MEDIATOR_MODULE } from "./mediator/mediator.module";
import { TEST_HTTP_SERVER_MODULE } from "./server/http/http.module";
import { TEST_VALIDATOR_MODULE } from "./validator/validator.module";

export const TEST_INFRA_MODULE = [
  TEST_CONFIG_MODULE,
  ...TEST_ENGINE_MODULE,
  ...TEST_MEDIATOR_MODULE,
  ...TEST_HTTP_SERVER_MODULE,
  ...TEST_VALIDATOR_MODULE,
];
