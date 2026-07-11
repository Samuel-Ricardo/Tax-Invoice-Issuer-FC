import { ContainerModule } from "inversify";
import { HttpServer } from "./http.server";
import { HTTP_SERVER_REGISTRY } from "./http.registry";
import { ExpressServerAdapter } from "./express/express.server";

export const HTTP_SERVER_MODULE = [
  new ContainerModule(({ bind }) => {
    bind<HttpServer>(HTTP_SERVER_REGISTRY.EXPRESS).to(ExpressServerAdapter);
  }),
];
