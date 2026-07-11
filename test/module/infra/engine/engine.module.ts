import { TEST_DATABASE_ENGINE_MODULE } from "./database/database.module";
import { TEST_SERVER_ENGINE_MODULE } from "./server/server.module";
import { TEST_ENGINE_VALIDATION_MODULE } from "./validation/validation.module";
//import { ENGINE_VALIDATION_MODULE } from "./validation/validation.module";

export const TEST_ENGINE_MODULE = [
  ...TEST_SERVER_ENGINE_MODULE,
  ...TEST_DATABASE_ENGINE_MODULE,
  TEST_ENGINE_VALIDATION_MODULE,
];
