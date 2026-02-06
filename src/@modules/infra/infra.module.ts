import { CONFIG_MODULE } from "./config/config.module";
import { ENGINE_MODULE } from "./engine/engine.module";
import { SERVER_MODULE } from "./server/server.module";

export const INFRA_MODULE = [CONFIG_MODULE, ...ENGINE_MODULE, ...SERVER_MODULE];
