import { merge } from "../@utils/module/load.util";
import { APPLICATION_MODULE } from "./application/application.module";
import { INFRA_MODULE } from "./infra/infra.module";

export const APP_MODULE = merge([...INFRA_MODULE, ...APPLICATION_MODULE]);
