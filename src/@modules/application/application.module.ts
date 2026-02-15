import { CONTROLLER_MODULE } from "./controller/controller.module";
import { REPOSITORY_MODULE } from "./repository/repository.module";
import { SERVICE_MODULE } from "./service/service.module";

export const APPLICATION_MODULE = [
  REPOSITORY_MODULE,
  SERVICE_MODULE,
  CONTROLLER_MODULE,
];
