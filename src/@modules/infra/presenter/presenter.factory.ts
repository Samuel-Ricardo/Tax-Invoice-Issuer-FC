import { load } from "../../../@utils/module/load.util";
import { Presenter } from "./presenter.interface";
import { PRESENTER_MODULE } from "./presenter.module";
import { PRESENTER_REGISTRY } from "./presenter.registry";

const _MODULE = load(PRESENTER_MODULE);

export const PRESENTER_FACTORY = {
  JSON: () => _MODULE.get<Presenter>(PRESENTER_REGISTRY.JSON),
};
