import { DATABASE_ENGINE_REGISTRY } from "./database/database.registry";
import { SERVER_ENGINE_REGISTRY } from "./server/server.registry";

export const ENGINE_REGISTRY = {
  SERVER: SERVER_ENGINE_REGISTRY,
  DATABASE: DATABASE_ENGINE_REGISTRY,
};
