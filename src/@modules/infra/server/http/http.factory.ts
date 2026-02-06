import { HTTP_SERVER_MODULE } from "./http.module";
import { merge } from "../../../../@utils/module/load.util";
import { HttpServer } from "./http.server";
import { HTTP_SERVER_REGISTRY } from "./http.registry";

const _MODULE = merge(HTTP_SERVER_MODULE);

export const HTTP_SERVER_FACTORY = {
  EXPRESS: () => _MODULE.get<HttpServer>(HTTP_SERVER_REGISTRY.EXPRESS),
};
