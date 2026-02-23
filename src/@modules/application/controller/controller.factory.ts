import { merge } from "../../../@utils/module/load.util";
import { Controller } from "../../domain/controller/controller.interface";
import { INFRA_MODULE } from "../../infra/infra.module";
import { SERVICE_MODULE } from "../service/service.module";
import { CONTROLLER_MODULE } from "./controller.module";
import { CONTROLLER_REGISTRY } from "./controller.registry";

const _MODULE = merge([...INFRA_MODULE, SERVICE_MODULE, CONTROLLER_MODULE]);

export const CONTROLLER_FACTORY = {
  INVOICE: () => _MODULE.get<Controller>(CONTROLLER_REGISTRY.INVOICE),
  EMAIL: () => _MODULE.get<Controller>(CONTROLLER_REGISTRY.EMAIL),
};
