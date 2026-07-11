import { TEST_CONTROLLER_REGISTRY } from "./controller/controller.registry";
import { TEST_REPOSITORY_REGISTRY } from "./repository/repository.registry";
import { TEST_SERVICE_REGISTRY } from "./service/service.registry";
import { TEST_SPECIFICATION_REGISTRY } from "./specification/specification.registry";
import { TEST_USE_CASE_REGISTRY } from "./use-case/use-case.registry";

export const TEST_APPLICATION_REGISTRY = {
  REPOSITORY: TEST_REPOSITORY_REGISTRY,
  USE_CASE: TEST_USE_CASE_REGISTRY,
  SERVICE: TEST_SERVICE_REGISTRY,
  SPECIFICATION: TEST_SPECIFICATION_REGISTRY,
  CONTROLLER: TEST_CONTROLLER_REGISTRY,
};
