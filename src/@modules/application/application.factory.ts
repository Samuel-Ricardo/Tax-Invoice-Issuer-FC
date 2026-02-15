import { CONTROLLER_FACTORY } from "./controller/controller.factory";
import { REPOSITORY_FACTORY } from "./repository/repository.factory";
import { SERVICE_FACTORY } from "./service/service.factory";
import { USE_CASE_FACTORY } from "./use-case/use-case.factory";

export const APPLICATION_FACTORY = {
  CONTROLLER: CONTROLLER_FACTORY,
  REPOSITORY: REPOSITORY_FACTORY,
  SERVICE: SERVICE_FACTORY,
  USE_CASE: USE_CASE_FACTORY,
};
