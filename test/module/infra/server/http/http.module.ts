import { ContainerModule } from "inversify";
import { TEST_HTTP_SERVER_ENGINE_MODULE } from "../../engine/server/http/http.module";
import { TEST_HTTP_SERVER_REGISTRY } from "./http.registry";
import {
  mockExpressServerAdapter,
  simulateExpressServerAdapter,
} from "./express/express.server";

export const TEST_HTTP_SERVER_MODULE = [
  TEST_HTTP_SERVER_ENGINE_MODULE,
  new ContainerModule(({ bind }) => {
    bind(TEST_HTTP_SERVER_REGISTRY.HTTP.EXPRESS.MOCK).toConstantValue(
      mockExpressServerAdapter,
    );

    bind(TEST_HTTP_SERVER_REGISTRY.HTTP.EXPRESS.SIMULATE).toDynamicValue(
      simulateExpressServerAdapter,
    );
  }),
];
