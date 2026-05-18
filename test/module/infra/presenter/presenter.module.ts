import { ContainerModule } from "inversify";
import { MOCK_PRESENTER_REGISTRY } from "./presenter.registry";
import { MockCsvPresenter } from "./csv/native.presenter";
import { MockJsonPresenter } from "./json/native.presenter";

export const MOCK_PRESENTER_MODULE = new ContainerModule(({ bind }) => {
  bind(MOCK_PRESENTER_REGISTRY.CSV.NATIVE).toConstantValue(MockCsvPresenter);
  bind(MOCK_PRESENTER_REGISTRY.JSON.NATIVE).toConstantValue(MockJsonPresenter);
});
