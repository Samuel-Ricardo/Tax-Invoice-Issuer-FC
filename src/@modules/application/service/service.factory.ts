import { loads } from "../../../@utils/module/load.util";
import { EmailService } from "../../domain/service/email/email.service";
import { InvoiceService } from "../../domain/service/invoice/invoice.service";
import { USE_CASE_MODULE } from "../use-case/use-case.module";
import { SERVICE_MODULE } from "./service.module";
import { SERVICE_REGISTRY } from "./service.registry";

const _MODULE = loads([USE_CASE_MODULE, SERVICE_MODULE]);

export const SERVICE_FACTORY = {
  INVOICE: () => _MODULE.get<InvoiceService>(SERVICE_REGISTRY.INVOICE),
  EMAIL: () => _MODULE.get<EmailService>(SERVICE_REGISTRY.EMAIL),
};
