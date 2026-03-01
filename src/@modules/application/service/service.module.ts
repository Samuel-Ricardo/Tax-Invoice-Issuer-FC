import { ContainerModule } from "inversify";
import { SERVICE_REGISTRY } from "./service.registry";
import { InvoiceServiceImpl } from "./invoice/invoice.service";
import { EmailServiceImpl } from "./email/email.service";
import { USE_CASE_MODULE } from "../use-case/use-case.module";

export const SERVICE_MODULE: ContainerModule[] = [
  ...USE_CASE_MODULE,
  new ContainerModule(({ bind }) => {
    bind(SERVICE_REGISTRY.INVOICE).to(InvoiceServiceImpl);
    bind(SERVICE_REGISTRY.EMAIL).to(EmailServiceImpl);
  }),
];
