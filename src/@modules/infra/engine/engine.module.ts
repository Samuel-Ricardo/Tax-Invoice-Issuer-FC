import { DATABASE_ENGINE_MODULE } from "./database/database.module";
import { SERVER_ENGINE_MODULE } from "./server/server.module";
import { ENGINE_VALIDATION_MODULE } from "./validation/validation.module";

export const ENGINE_MODULE = [
  ...SERVER_ENGINE_MODULE,
  DATABASE_ENGINE_MODULE,
  ENGINE_VALIDATION_MODULE,
];
