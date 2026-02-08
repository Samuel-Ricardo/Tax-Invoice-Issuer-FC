import { load } from "../../../@utils/module/load.util";
import { Controller } from "../../domain/controller/controller.interface";
import { CONTROLLER_MODULE } from "./controller.module";
import { CONTROLLER_REGISTRY } from "./controller.registry";

const _MODULE = load(CONTROLLER_MODULE);

export const CONTROLLER_FACTORY = {
  INVOICE: () => _MODULE.get<Controller>(CONTROLLER_REGISTRY.INVOICE),
};
