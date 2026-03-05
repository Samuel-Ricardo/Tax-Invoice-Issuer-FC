import { DataLogger } from "../../../../@decorators/log/data.decorator";
import { Presenter } from "../presenter.interface";

export class JsonPresenter implements Presenter {
  @DataLogger("PRESENTER")
  present(data: any) {
    return JSON.stringify(data);
  }
}
