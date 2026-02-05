import { merge } from "../@utils/module/merge.util";
import { INFRA_MODULE } from "./infra/infra.module";

export const APP_MODULE = merge(INFRA_MODULE);
