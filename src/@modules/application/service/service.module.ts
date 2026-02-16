import { ContainerModule } from "inversify";
import { SERVICE_REGISTRY } from "./service.registry";
import { InvoiceServiceImpl } from "./invoice/invoice.service";
import { EmailServiceImpl } from "./email/email.service";

export const SERVICE_MODULE = new ContainerModule(({ bind }) => {
  bind(SERVICE_REGISTRY.INVOICE).to(InvoiceServiceImpl);
  bind(SERVICE_REGISTRY.EMAIL).to(EmailServiceImpl);
});
