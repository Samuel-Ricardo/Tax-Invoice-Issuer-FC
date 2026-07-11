import { loads } from "../../../@utils/module/load.util";
import { ListContractUseCase } from "../../domain/use-case/contract/list.use-case";
import { SendInvoiceEmailUseCase } from "../../domain/use-case/email/send/invoice.use-case";
import { GenerateInvoiceUseCase } from "../../domain/use-case/invoice/generate.use-case";
import { USE_CASE_MODULE } from "./use-case.module";
import { USE_CASE_REGISTRY } from "./use-case.registry";

const _MODULE = loads(USE_CASE_MODULE);

export const USE_CASE_FACTORY = {
  INVOICE: {
    GENERATE: () =>
      _MODULE.get<GenerateInvoiceUseCase>(USE_CASE_REGISTRY.INVOICE.GENERATE),
  },
  CONTRACT: {
    LIST: () =>
      _MODULE.get<ListContractUseCase>(USE_CASE_REGISTRY.CONTRACT.LIST),
  },
  EMAIL: {
    SEND: {
      INVOICE: () =>
        _MODULE.get<SendInvoiceEmailUseCase>(
          USE_CASE_REGISTRY.EMAIL.SEND.INVOICE,
        ),
    },
  },
};
