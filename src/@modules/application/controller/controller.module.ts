import { ContainerModule } from "inversify";
import { Controller } from "../../domain/controller/controller.interface";
import { InvoiceController } from "./invoice/invoice.controller";
import { CONTROLLER_REGISTRY } from "./controller.registry";
import { EmailController } from "./email/email.controller";
import { SERVICE_MODULE } from "../service/service.module";
import { INFRA_MODULE } from "../../infra/infra.module";
import { SPECIFICATION_MODULE } from "../specificaiton/specification.module";

export const CONTROLLER_MODULE = [
  ...INFRA_MODULE,
  ...SERVICE_MODULE,
  ...SPECIFICATION_MODULE,
  new ContainerModule(({ bind }) => {
    bind<Controller>(CONTROLLER_REGISTRY.INVOICE).to(InvoiceController);
    bind<Controller>(CONTROLLER_REGISTRY.EMAIL).to(EmailController);
  }),
];
