import { DATABASE_ENGINE_REGISTRY } from "./database/database.registry";
import { SERVER_ENGINE_REGISTRY } from "./server/server.registry";
import { ENGINE_VALIDATION_REGISTRY } from "./validation/validation.registry";

export const ENGINE_REGISTRY = {
  SERVER: SERVER_ENGINE_REGISTRY,
  DATABASE: DATABASE_ENGINE_REGISTRY,
  VALIDATION: ENGINE_VALIDATION_REGISTRY,
};
