import { loads } from "../../../@utils/module/load.util";
import { SPECIFICATION_MODULE } from "./specification.module";
import { SPECIFICATION_REGISTRY } from "./specification.registry";
import { InvoiceSpecificationZod } from "./zod/invoice.specification";

const _MODULE = loads(SPECIFICATION_MODULE);

export const SPECIFICATION_FACTORY = {
  ZOD: {
    INVOICE: () =>
      _MODULE.get<InvoiceSpecificationZod>(SPECIFICATION_REGISTRY.ZOD.INVOICE),
  },
};
