import { CONTROLLER_FACTORY } from "./controller/controller.factory";
import { REPOSITORY_FACTORY } from "./repository/repository.factory";
import { SERVICE_FACTORY } from "./service/service.factory";

export const APPLICATION_FACTORY = {
  CONTROLLER: CONTROLLER_FACTORY,
  REPOSITORY: REPOSITORY_FACTORY,
};
