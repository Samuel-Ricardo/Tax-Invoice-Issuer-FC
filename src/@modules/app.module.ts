import { loads } from "../@utils/module/load.util";
import { INFRA_MODULE } from "./infra/infra.module";
import { APPLICATION_MODULE } from "./application/application.module";

export const APP_MODULE = loads([...INFRA_MODULE, ...APPLICATION_MODULE]);
