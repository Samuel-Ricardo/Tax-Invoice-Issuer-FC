import { CONFIG_FACTORY } from "./config/config.factory";
import { ENGINE_FACTORY } from "./engine/engine.factory";
import { PRESENTER_FACTORY } from "./presenter/presenter.factory";
import { SERVER_FACTORY } from "./server/server.factory";

export const INFRA_FACTORY = {
  ENGINE: ENGINE_FACTORY,
  SERVER: SERVER_FACTORY,
  CONFIG: CONFIG_FACTORY,
  PRESENTER: PRESENTER_FACTORY,
};
