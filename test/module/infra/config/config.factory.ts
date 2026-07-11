import { Environment } from "../../../../src/@types/config/env.type";
import { Events } from "../../../../src/@types/config/events.type";
import { load } from "../../../../src/@utils/module/load.util";
import { TEST_CONFIG_MODULE } from "./config.module";
import { TEST_CONFIG_REGISTRY } from "./config.registry";

const _MODULE = load(TEST_CONFIG_MODULE);

export const TEST_CONFIG_FACTORY = {
  ENV: {
    IRONMENT: () => _MODULE.get<Environment>(TEST_CONFIG_REGISTRY.ENV.IRONMENT),
    DATABASE: {
      URL: () => _MODULE.get<string>(TEST_CONFIG_REGISTRY.ENV.DATABASE.URL),
    },
  },

  EVENT: {
    S: () => _MODULE.get<Events>(TEST_CONFIG_REGISTRY.EVENT.S),

    INVOICE: {
      GENERATED: () =>
        _MODULE.get<string>(TEST_CONFIG_REGISTRY.EVENT.INVOICE.GENERATED),
    },
  },
};
