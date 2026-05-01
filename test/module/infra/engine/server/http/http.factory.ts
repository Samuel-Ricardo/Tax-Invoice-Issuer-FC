import { TEST_HTTP_SERVER_ENGINE_MODULE } from "./http.module";
import { load } from "../../../../../../src/@utils/module/load.util";
import { DeepMockProxy } from "jest-mock-extended";
import { TEST_HTTP_SERVER_ENGINE_REGISTRY } from "./http.registry";
import { TExpress } from "../../../../../../src/@types/engine/server/http/express.type";
import { Cors } from "../../../../../../src/@types/engine/server/http/cors.type";
import { JsonParser } from "../../../../../../src/@types/engine/server/http/parser/json.type";

const _MODULE = load(TEST_HTTP_SERVER_ENGINE_MODULE, "Transient");

export const TEST_HTTP_SERVER_ENGINE_FACTORY = {
  EXPRESS: {
    _: () =>
      _MODULE.get<DeepMockProxy<TExpress>>(
        TEST_HTTP_SERVER_ENGINE_REGISTRY.EXPRESS._,
      ),
    CORS: () =>
      _MODULE.get<DeepMockProxy<Cors>>(
        TEST_HTTP_SERVER_ENGINE_REGISTRY.EXPRESS.CORS,
      ),
    PARSER: {
      JSON: () =>
        _MODULE.get<DeepMockProxy<JsonParser>>(
          TEST_HTTP_SERVER_ENGINE_REGISTRY.EXPRESS.PARSER.JSON,
        ),
    },
  },
};
