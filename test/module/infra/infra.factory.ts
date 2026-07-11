import { TEST_CONFIG_FACTORY } from "./config/config.factory";
import { TEST_ENGINE_FACTORY } from "./engine/engine.factory";
import { MOCK_PRESENTER_FACTORY } from "./presenter/presenter.factory";
import { TEST_HTTP_SERVER_FACTORY } from "./server/http/http.factory";
import { TEST_VALIDATOR_FACTORY } from "./validator/validator.factory";

export const TEST_INFRA_FACTORY = {
  CONFIG: TEST_CONFIG_FACTORY,
  ENGINE: TEST_ENGINE_FACTORY,
  SERVER: TEST_HTTP_SERVER_FACTORY,
  VALIDATION: TEST_VALIDATOR_FACTORY,
  PRESEENTER: MOCK_PRESENTER_FACTORY,
};
