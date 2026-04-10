import { CONFIG_FACTORY } from "./config/config.factory";
import { ENGINE_FACTORY } from "./engine/engine.factory";
import { MEDIATOR_FACTORY } from "./mediator/mediator.factory";
import { PRESENTER_FACTORY } from "./presenter/presenter.factory";
import { SERVER_FACTORY } from "./server/server.factory";
import { VALIDATOR_FACTORY } from "./validator/validator.factory";

export const INFRA_FACTORY = {
  ENGINE: ENGINE_FACTORY,
  SERVER: SERVER_FACTORY,
  CONFIG: CONFIG_FACTORY,
  PRESENTER: PRESENTER_FACTORY,
  MEDIATOR: MEDIATOR_FACTORY,
  VALIDATOR: VALIDATOR_FACTORY,
};
