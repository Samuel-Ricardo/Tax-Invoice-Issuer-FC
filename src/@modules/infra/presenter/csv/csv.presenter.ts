import moment from "moment";
import { Presenter } from "../presenter.interface";
import { DataLogger } from "../../../../@decorators/log/data.decorator";

export default class CsvPresenter implements Presenter {
  @DataLogger("PRESENTER")
  present(data: any[]) {
    return data
      .flatMap((d) =>
        [moment(d.date).format("YYYY-MM-DD"), `${d.amount}`].join(";"),
      )
      .join("\n");
  }
}
