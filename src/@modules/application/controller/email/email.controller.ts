import { inject, injectable } from "inversify";
import { Controller } from "../../../domain/controller/controller.interface";
import { Mediator } from "../../../infra/mediator/mediator.interface";
import { MODULE } from "../../../app.registry";
import { Invoice } from "../../../domain/entity/invoice.entity";
import { Events } from "../../../../@types/config/events.type";
import { EmailService } from "../../../domain/service/email/email.service";
import { InputLogger } from "../../../../@decorators/log/data.decorator";
import { Specification } from "../../../domain/specification/specification.interface";
import { Validate } from "../../../../@decorators/validation/validation.decorator";

@injectable()
export class EmailController implements Controller {
  constructor(
    @inject(MODULE.INFRA.MEDIATOR.NATIVE)
    private readonly mediator: Mediator,

    @inject(MODULE.INFRA.CONFIG.EVENT.S)
    private readonly EVENT: Events,

    @inject(MODULE.APPLICATION.SERVICE.EMAIL)
    private readonly service: EmailService,

    @inject(MODULE.APPLICATION.SPECIFICATION.ZOD.EMAIL)
    private readonly specification: Specification<Invoice>,
  ) {}

  public async setup() {
    this.mediator.on(
      this.EVENT.INVOICE.GENERATED,
      this.sendMailOnInvoiceGenereted,
    );
  }

  public async start() {}

  @InputLogger({ context: "CONTROLLER", message: "EMAIL" })
  @Validate("specification")
  private async sendMailOnInvoiceGenereted(data: Invoice[]) {
    await this.service.sendInvoices(data);
  }
}
