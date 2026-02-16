import { load } from "../../../@utils/module/load.util";
import { EmailService } from "../../domain/service/email/email.service";
import { InvoiceService } from "../../domain/service/invoice/invoice.service";
import { SERVICE_MODULE } from "./service.module";
import { SERVICE_REGISTRY } from "./service.registry";

const _MODULE = load(SERVICE_MODULE);

export const SERVICE_FACTORY = {
  INVOICE: () => _MODULE.get<InvoiceService>(SERVICE_REGISTRY.INVOICE),
  EMAIL: () => _MODULE.get<EmailService>(SERVICE_REGISTRY.EMAIL),
};
