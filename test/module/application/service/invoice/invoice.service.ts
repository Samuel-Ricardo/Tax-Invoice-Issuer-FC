import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { InvoiceServiceImpl } from "../../../../../src/@modules/application/service/invoice/invoice.service";
import { ResolutionContext } from "inversify";
import { TEST_MODULE } from "../../../app.registry";
import { Contract } from "../../../../../src/@modules/domain/entity/contract.entity";
import { ListContractUseCaseImpl } from "../../../../../src/@modules/application/use-case/contract/list.use-case";
import { GenerateInvoiceUseCaseImpl } from "../../../../../src/@modules/application/use-case/invoice/generate.use-case";

export const mockInvoiceService = mockDeep<InvoiceServiceImpl>();

export const simulateInvoiceService = (module: ResolutionContext) => {
  const generateInvoice = module.get<DeepMockProxy<GenerateInvoiceUseCaseImpl>>(
    TEST_MODULE.APPLICATION.USE_CASE.INVOICE.MOCK,
  );

  const listContract = module.get<DeepMockProxy<ListContractUseCaseImpl>>(
    TEST_MODULE.APPLICATION.USE_CASE.CONTRACT.LIST.MOCK,
  );

  return {
    use_case: {
      generate: {
        invoice: generateInvoice,
      },
      list: {
        contract: listContract,
      },
    },

    service: new InvoiceServiceImpl(generateInvoice, listContract),
  };
};
