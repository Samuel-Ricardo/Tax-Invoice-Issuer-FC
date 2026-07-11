import { DeepMockProxy } from "jest-mock-extended";
import { InvoiceService } from "../../../../src/@modules/domain/service/invoice/invoice.service";
import { GenerateInvoiceUseCase } from "../../../../src/@modules/domain/use-case/invoice/generate.use-case";
import { ListContractUseCase } from "../../../../src/@modules/domain/use-case/contract/list.use-case";

export interface SimulatedInvoiceService {
  service: InvoiceService;
  use_case: {
    generate: {
      invoice: DeepMockProxy<GenerateInvoiceUseCase>;
    };
    list: {
      contract: DeepMockProxy<ListContractUseCase>;
    };
  };
}
