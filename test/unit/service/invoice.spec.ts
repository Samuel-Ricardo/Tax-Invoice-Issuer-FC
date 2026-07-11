import { CONTRACT_LIST_MOCK } from "../../@mock/contract/list.mock";
import { INVOICE_GENERATE_VALID_INPUT } from "../../@mock/invoice/generate.mock";
import { INVOICE_RESULT_LIST } from "../../@mock/invoice/result.mock";
import { TEST_MODULES } from "../../module/app.factory";
import { InvoiceDTO } from "../../../src/@modules/domain/DTO/invoice.dto";

describe("[INVOICE] - [SERVICE]", () => {
  it("[UNIT] | [INVOICE] - [SERVICE] > created with correct dependencies", () => {
    const module = TEST_MODULES.APPLICATION.SERVICE.INVOICE.SIMULATE();

    expect(module.service).toBeDefined();
    expect(module.use_case.generate.invoice).toBeDefined();
    expect(module.use_case.list.contract).toBeDefined();
  });

  it("[UNIT] | [INVOICE] - CALLS > [USE CASE] > [GENERATE]", async () => {
    const module = TEST_MODULES.APPLICATION.SERVICE.INVOICE.SIMULATE();

    module.use_case.list.contract.execute.mockResolvedValue(CONTRACT_LIST_MOCK);
    module.use_case.generate.invoice.execute.mockResolvedValue(
      INVOICE_RESULT_LIST,
    );

    const invoiceInput = INVOICE_GENERATE_VALID_INPUT as InvoiceDTO;
    const result = await module.service.generate(invoiceInput);

    expect(module.use_case.list.contract.execute).toHaveBeenCalled();
    expect(module.use_case.generate.invoice.execute).toHaveBeenCalledWith({
      contracts: CONTRACT_LIST_MOCK,
      invoice: invoiceInput,
    });
    expect(result).toBe(INVOICE_RESULT_LIST);
  });
});
