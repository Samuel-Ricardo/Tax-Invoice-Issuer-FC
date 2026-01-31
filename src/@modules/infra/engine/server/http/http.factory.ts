import { Container } from "inversify";
import { HTTP_SERVER_ENGINE_MODULE } from "./http.module";
import { TExpress } from "../../../../../@types/engine/server/http/express.type";
import { Cors } from "../../../../../@types/engine/server/http/cors.type";
import { JsonParser } from "../../../../../@types/engine/server/http/parser/json.type";
import { HTTP_SERVER_ENGINE_REGISTRY } from "./http.registry";

const _MODULE = new Container({
  autobind: true,
  defaultScope: "Singleton",
});
_MODULE.load(HTTP_SERVER_ENGINE_MODULE);

export const HTTP_SERVER_ENGINE_FACTORY = {
  EXPRESS: {
    _: () => _MODULE.get<TExpress>(HTTP_SERVER_ENGINE_REGISTRY.EXPRESS._),
    CORS: () => _MODULE.get<Cors>(HTTP_SERVER_ENGINE_REGISTRY.EXPRESS.CORS),
    PARSER: {
      JSON: () =>
        _MODULE.get<JsonParser>(
          HTTP_SERVER_ENGINE_REGISTRY.EXPRESS.PARSER.JSON,
        ),
    },
  },
};
