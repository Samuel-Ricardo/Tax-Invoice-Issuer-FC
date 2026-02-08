import { ContainerModule } from "inversify";
import { Controller } from "../../domain/controller/controller.interface";
import { InvoiceController } from "./invoice/invoice.controller";
import { CONTROLLER_REGISTRY } from "./controller.registry";

export const CONTROLLER_MODULE = new ContainerModule(({ bind }) => {
  bind<Controller>(CONTROLLER_REGISTRY.INVOICE).to(InvoiceController);
});
