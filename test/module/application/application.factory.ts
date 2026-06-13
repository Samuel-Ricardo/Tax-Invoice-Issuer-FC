import { TEST_REPOSITORY_FACTORY } from "./repository/repository.factory";
import { TEST_SERVICE_FACTORY } from "./service/service.factory";
import { TEST_SPECIFICATION_FACTORY } from "./specification/specification.factory";
import { TEST_USE_CASE_FACTORY } from "./use-case/use-case.factory";

export const TEST_APPLICATION_FACTORY = {
  REPOSITORY: TEST_REPOSITORY_FACTORY,
  USE_CASE: TEST_USE_CASE_FACTORY,
  SERVICE: TEST_SERVICE_FACTORY,
  SPECIFICATION: TEST_SPECIFICATION_FACTORY,
};
