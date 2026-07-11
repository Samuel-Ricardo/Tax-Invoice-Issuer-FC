import { TEST_DATABASE_ENGINE_REGISTRY } from "./database/database.registry";
import { TEST_SERVER_ENGINE_REGISTRY } from "./server/server.registry";
import { TEST_ENGINE_VALIDATION_REGISTRY } from "./validation/validation.registry";

export const TEST_ENGINE_REGISTRY = {
  SERVER: TEST_SERVER_ENGINE_REGISTRY,
  DATABASE: TEST_DATABASE_ENGINE_REGISTRY,
  VALIDATION: TEST_ENGINE_VALIDATION_REGISTRY,
};
