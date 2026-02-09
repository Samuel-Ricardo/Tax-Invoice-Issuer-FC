import { DATABASE_ENGINE_MODULE } from "./database/database.module";
import { SERVER_ENGINE_MODULE } from "./server/server.module";

export const ENGINE_MODULE = [...SERVER_ENGINE_MODULE, DATABASE_ENGINE_MODULE];
