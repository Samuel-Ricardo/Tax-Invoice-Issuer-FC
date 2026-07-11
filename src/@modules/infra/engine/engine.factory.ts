import { DATABASE_ENGINE_FACTORY } from "./database/database.factory";
import { SERVER_ENGINE_FACTORY } from "./server/server.factory";
import { ENGINE_VALIDATION_FACTORY } from "./validation/validation.factory";

export const ENGINE_FACTORY = {
  SERVER: SERVER_ENGINE_FACTORY,
  DATABASE: DATABASE_ENGINE_FACTORY,
  VALIDATION: ENGINE_VALIDATION_FACTORY,
};
