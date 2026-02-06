import { ContainerModule } from "inversify";
import { Presenter } from "./presenter.interface";
import { PRESENTER_REGISTRY } from "./presenter.registry";
import { JsonPresenter } from "./json/json.presenter";

export const PRESENTER_MODULE = new ContainerModule(({ bind }) => {
  bind<Presenter>(PRESENTER_REGISTRY.JSON).to(JsonPresenter);
});
