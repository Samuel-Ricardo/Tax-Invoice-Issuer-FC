import { ContainerModule } from "inversify";
import { Environment } from "../../../../src/@types/config/env.type";
import { Events } from "../../../../src/@types/config/events.type";
import { TEST_CONFIG_REGISTRY } from "./config.registry";
import { TEST_ENV } from "./env/env.config";
import { TEST_EVENTS } from "./event/events.config";

export const TEST_CONFIG_MODULE = new ContainerModule(({ bind }) => {
  bind<Environment>(TEST_CONFIG_REGISTRY.ENV.IRONMENT).toConstantValue(
    TEST_ENV,
  );
  bind<string>(TEST_CONFIG_REGISTRY.ENV.DATABASE.URL).toConstantValue(
    TEST_ENV.DATABASE.URL,
  );

  bind<Events>(TEST_CONFIG_REGISTRY.EVENT.S).toConstantValue(TEST_EVENTS);

  bind<string>(TEST_CONFIG_REGISTRY.EVENT.INVOICE.GENERATED).toConstantValue(
    TEST_EVENTS.INVOICE.GENERATED,
  );
});
