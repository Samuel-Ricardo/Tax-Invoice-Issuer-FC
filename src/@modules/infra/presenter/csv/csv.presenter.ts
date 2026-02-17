import moment from "moment";
import { Presenter } from "../presenter.interface";

export default class CsvPresenter implements Presenter {
  present(data: any[]) {
    return data
      .flatMap((d) =>
        [moment(d.date).format("YYYY-MM-DD"), `${d.amount}`].join(";"),
      )
      .join("\n");
  }
}
