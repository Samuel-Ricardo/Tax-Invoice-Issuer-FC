import { inject, injectable } from "inversify";
import { InvoiceService } from "../../../domain/service/invoice/invoice.service";
import { HttpServer } from "../../../infra/server/http/http.server";
import { MODULE } from "../../../app.registry";
import { Controller } from "../../../domain/controller/controller.interface";
import { Presenter } from "../../../infra/presenter/presenter.interface";
import { DataLogger } from "../../../../@decorators/log/data.decorator";
import { InvoiceDTO } from "../../../domain/DTO/invoice.dto";

@injectable()
export class InvoiceController implements Controller {
  constructor(
    @inject(MODULE.INFRA.SERVER.HTTP.EXPRESS)
    private readonly server: HttpServer,
    @inject(MODULE.INFRA.PRESENTER.JSON)
    private readonly presenter: Presenter,
    @inject(MODULE.APPLICATION.SERVICE.INVOICE)
    private readonly service: InvoiceService,
  ) {}

  public async setup() {
    this.setupRoutes();
  }

  public async start() {
    this.server.listen();
  }

  private setupRoutes() {
    this.server.on("post", "/invoice", this.generateInvoice.bind(this));
    this.server.on("get", "/", async () => ({
      hello: "world",
    }));
  }

  //TODO: VALIDATION WITH ZOD & ERROR HANDLING DECORATORS
  @DataLogger()
  private async generateInvoice(_params, body: InvoiceDTO, _headers) {
    if (!body || !body.month || !body.year || !body.type) {
      throw new Error(
        "Invalid request body. Required fields: month, year, type",
      );
    }
    return this.service.generate(body).then(this.presenter.present);
  }
}
