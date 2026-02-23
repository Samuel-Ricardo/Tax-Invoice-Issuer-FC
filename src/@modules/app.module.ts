import { merge } from "../@utils/module/load.util";
import { INFRA_MODULE } from "./infra/infra.module";
import { APPLICATION_MODULE } from "./application/application.module";

export const APP_MODULE = merge([...INFRA_MODULE, ...APPLICATION_MODULE]);
