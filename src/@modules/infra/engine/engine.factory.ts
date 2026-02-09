import { DATABASE_ENGINE_FACTORY } from "./database/database.factory";
import { SERVER_ENGINE_FACTORY } from "./server/server.factory";

export const ENGINE_FACTORY = {
  SERVER: SERVER_ENGINE_FACTORY,
  DATABASE: DATABASE_ENGINE_FACTORY,
};
