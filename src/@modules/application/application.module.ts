import { CONTROLLER_MODULE } from "./controller/controller.module";
import { REPOSITORY_MODULE } from "./repository/repository.module";
import { SERVICE_MODULE } from "./service/service.module";
import { USE_CASE_MODULE } from "./use-case/use-case.module";

export const APPLICATION_MODULE = [
  ...REPOSITORY_MODULE,
  ...USE_CASE_MODULE,
  ...SERVICE_MODULE,
  ...CONTROLLER_MODULE,
];
