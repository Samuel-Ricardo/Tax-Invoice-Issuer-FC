import { Presenter } from "../presenter.interface";

export class JsonPresenter implements Presenter {
  present(data: any) {
    return JSON.stringify(data);
  }
}
