import { CONFIG_REGISTRY } from "./config/config.registry";
import { ENGINE_REGISTRY } from "./engine/engine.registry";
import { MEDIATOR_REGISTRY } from "./mediator/mediator.registry";
import { PRESENTER_REGISTRY } from "./presenter/presenter.registry";
import { SERVER_REGISTRY } from "./server/server.registry";

export const INFRA_REGISTRY = {
  ENGINE: ENGINE_REGISTRY,
  SERVER: SERVER_REGISTRY,
  CONFIG: CONFIG_REGISTRY,
  PRESENTER: PRESENTER_REGISTRY,
  MEDIATOR: MEDIATOR_REGISTRY,
};
