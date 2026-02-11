import { load } from "../../../@utils/module/load.util";
import { Mediator } from "./mediator.interface";
import { MEDIATOR_MODULE } from "./mediator.module";
import { MEDIATOR_REGISTRY } from "./mediator.registry";

const _MODULE = load(MEDIATOR_MODULE);

export const MEDIATOR_FACTORY = {
  NATIVE: () => _MODULE.get<Mediator>(MEDIATOR_REGISTRY.NATIVE),
};
