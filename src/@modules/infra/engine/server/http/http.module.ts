import { ContainerModule } from "inversify";
import { HTTP_SERVER_ENGINE_REGISTRY } from "./http.registry";
import { TExpress } from "../../../../../@types/engine/server/http/express.type";
import { EXPRESS_ENGINE } from "./express/express.engine";
import { Cors } from "../../../../../@types/engine/server/http/cors.type";
import { JsonParser } from "../../../../../@types/engine/server/http/parser/json.type";
import { JSON_PARSER_ENGINE } from "./express/parser/json.engine";
import { CORS_ENGINE } from "./express/cors.engine";

export const HTTP_SERVER_ENGINE_MODULE = new ContainerModule(({ bind }) => {
  bind<TExpress>(HTTP_SERVER_ENGINE_REGISTRY.EXPRESS._).toConstantValue(
    EXPRESS_ENGINE,
  );
  bind<Cors>(HTTP_SERVER_ENGINE_REGISTRY.EXPRESS.CORS).toConstantValue(
    CORS_ENGINE,
  );

  bind<JsonParser>(
    HTTP_SERVER_ENGINE_REGISTRY.EXPRESS.PARSER.JSON,
  ).toConstantValue(JSON_PARSER_ENGINE);
});
