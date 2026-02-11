import { Environment } from "../../../@types/config/env.type";
import { CONFIG_MODULE } from "./config.module";
import { CONFIG_REGISTRY } from "./config.registry";
import { load } from "../../../@utils/module/load.util";
import { Events } from "../../../@types/config/events.type";

const _MODULE = load(CONFIG_MODULE);

export const CONFIG_FACTORY = {
  ENV: {
    IRONMENT: () => _MODULE.get<Environment>(CONFIG_REGISTRY.ENV.IRONMENT),
    DATABASE: {
      URL: () => _MODULE.get<string>(CONFIG_REGISTRY.ENV.DATABASE.URL),
    },
  },

  EVENT: {
    S: () => _MODULE.get<Events>(CONFIG_REGISTRY.EVENT.S),

    INVOICE: {
      GENERATED: () =>
        _MODULE.get<string>(CONFIG_REGISTRY.EVENT.INVOICE.GENERATED),
    },
  },
};
