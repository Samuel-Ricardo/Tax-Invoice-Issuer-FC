import { CONTROLLER_MODULE } from "./controller/controller.module";
import { REPOSITORY_MODULE } from "./repository/repository.module";

export const APPLICATION_MODULE = [REPOSITORY_MODULE, CONTROLLER_MODULE];
