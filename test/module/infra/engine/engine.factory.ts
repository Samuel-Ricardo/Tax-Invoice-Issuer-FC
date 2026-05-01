import { TEST_DATABASE_ENGINE_FACTORY } from "./database/database.factory";
import { TEST_SERVER_ENGINE_FACTORY } from "./server/server.factory";
import { TEST_ENGINE_VALIDATION_FACTORY } from "./validation/validation.factory";

export const TEST_ENGINE_FACTORY = {
  SERVER: TEST_SERVER_ENGINE_FACTORY,
  DATABASE: TEST_DATABASE_ENGINE_FACTORY,
  VALIDATION: TEST_ENGINE_VALIDATION_FACTORY,
};
