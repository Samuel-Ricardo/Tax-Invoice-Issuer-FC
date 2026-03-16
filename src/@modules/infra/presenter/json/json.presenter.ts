import { DataLogger } from "../../../../@decorators/log/data.decorator";
import { Presenter } from "../presenter.interface";

export class JsonPresenter implements Presenter {
  @DataLogger({ context: "PRESENTER", message: "JSON" })
  present(data: any) {
    return JSON.stringify(data);
  }
}
