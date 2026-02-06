import { ContainerModule } from "inversify";
import { CONFIG_REGISTRY } from "./config.registry";
import { ENV } from "./env/env.config";
import { Environment } from "../../../@types/config/env.type";

export const CONFIG_MODULE = new ContainerModule(({ bind }) => {
  bind<Environment>(CONFIG_REGISTRY.ENV.IRONMENT).toConstantValue(ENV);
  bind<string>(CONFIG_REGISTRY.ENV.DATABASE.URL).toConstantValue(
    ENV.DATABASE.URL,
  );
});
