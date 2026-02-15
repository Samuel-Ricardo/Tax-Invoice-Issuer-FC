import { CONTROLLER_REGISTRY } from "./controller/controller.registry";
import { REPOSITORY_REGISTRY } from "./repository/repository.registry";
import { SERVICE_REGISTRY } from "./service/service.registry";
import { USE_CASE_REGISTRY } from "./use-case/use-case.registry";

export const APPLICATION_REGISTRY = {
  CONTROLLER: CONTROLLER_REGISTRY,
  REPOSITORY: REPOSITORY_REGISTRY,
  SERVICE: SERVICE_REGISTRY,
  USE_CASE: USE_CASE_REGISTRY,
};
