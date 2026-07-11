import { ContainerModule } from "inversify";

import { MOCK_JSON_PARSER_ENGINE } from "./express/parser/json.engine";
import { MOCK_CORS_ENGINE } from "./express/cors.engine";
import { Cors } from "../../../../../../src/@types/engine/server/http/cors.type";
import { TExpress } from "../../../../../../src/@types/engine/server/http/express.type";
import { JsonParser } from "../../../../../../src/@types/engine/server/http/parser/json.type";
import { MOCK_EXPRESS_ENGINE } from "./express/express.engine";
import { TEST_HTTP_SERVER_ENGINE_REGISTRY } from "./http.registry";

export const TEST_HTTP_SERVER_ENGINE_MODULE = new ContainerModule(
  ({ bind }) => {
    bind<TExpress>(TEST_HTTP_SERVER_ENGINE_REGISTRY.EXPRESS._).toConstantValue(
      MOCK_EXPRESS_ENGINE,
    );
    bind<Cors>(TEST_HTTP_SERVER_ENGINE_REGISTRY.EXPRESS.CORS).toConstantValue(
      MOCK_CORS_ENGINE,
    );

    bind<JsonParser>(
      TEST_HTTP_SERVER_ENGINE_REGISTRY.EXPRESS.PARSER.JSON,
    ).toConstantValue(MOCK_JSON_PARSER_ENGINE);
  },
);
