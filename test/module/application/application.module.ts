import { TEST_CONTROLLER_MODULE } from "./controller/controller.module";
import { TEST_REPOSITORY_MODULE } from "./repository/repository.module";
import { TEST_SERVICE_MODULE } from "./service/service.module";
import { TEST_SPECIFICATION_MODULE } from "./specification/specification.module";
import { TEST_USE_CASE_MODULE } from "./use-case/use-case.module";

export const TEST_APPLICATION_MODULE = [
  ...TEST_REPOSITORY_MODULE,
  ...TEST_USE_CASE_MODULE,
  ...TEST_SERVICE_MODULE,
  ...TEST_SPECIFICATION_MODULE,
  ...TEST_CONTROLLER_MODULE,
];
