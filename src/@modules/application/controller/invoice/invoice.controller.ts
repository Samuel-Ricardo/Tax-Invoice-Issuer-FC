import { inject, injectable } from "inversify";
import { InvoiceService } from "../../service/invoice/invoice.interface";
import { HttpServer } from "../../../infra/server/http/http.server";
import { MODULE } from "../../../app.registry";
import { Controller } from "../controller.interface";
import { Presenter } from "../../../infra/presenter/presenter.interface";

@injectable()
export class InvoiceController implements Controller {
  constructor(
    @inject(MODULE.INFRA.SERVER.HTTP.EXPRESS)
    private readonly server: HttpServer,
    @inject(MODULE.INFRA.PRESENTER.JSON)
    private readonly presenter: Presenter,
    //    @inject()
    private readonly service: InvoiceService,
  ) {}

  public startup() {
    this.generateInvoice();
    this.server.listen();
  }

  private generateInvoice() {
    this.server.on("post", "/invoice", async (params, body, headers) =>
      this.service.generate(body).then(this.presenter.present),
    );
  }
}
