import { loads } from "../../../../src/@utils/module/load.util";
import { TEST_USE_CASE_MODULE } from "./use-case.module";
import { TEST_USE_CASE_REGISTRY } from "./use-case.registry";
import { SimulatedGenerateInvoiceUseCase } from "../../../@types/use-case/invoice/simulated.type";
import { SimulatedListContractUseCase } from "../../../@types/use-case/contract/simulated.type";
import { SimulatedSendInvoiceEmailUseCase } from "../../../@types/use-case/email/simulated.type";

const _MODULE = loads(TEST_USE_CASE_MODULE);

export const TEST_USE_CASE_FACTORY = {
  CONTRACT: {
    LIST: {
      MOCK: () => _MODULE.get(TEST_USE_CASE_REGISTRY.CONTRACT.LIST.MOCK),
      SIMULATE: () =>
        _MODULE.get(
          TEST_USE_CASE_REGISTRY.CONTRACT.LIST.SIMULATE,
        ) as SimulatedListContractUseCase,
    },
  },
  EMAIL: {
    SEND: {
      INVOICE: {
        MOCK: () => _MODULE.get(TEST_USE_CASE_REGISTRY.EMAIL.SEND.INVOICE.MOCK),
        SIMULATE: () =>
          _MODULE.get(
            TEST_USE_CASE_REGISTRY.EMAIL.SEND.INVOICE.SIMULATE,
          ) as SimulatedSendInvoiceEmailUseCase,
      },
    },
  },
  INVOICE: {
    MOCK: () => _MODULE.get(TEST_USE_CASE_REGISTRY.INVOICE.MOCK),
    SIMULATE: () =>
      _MODULE.get(
        TEST_USE_CASE_REGISTRY.INVOICE.SIMULATE,
      ) as SimulatedGenerateInvoiceUseCase,
  },
};
