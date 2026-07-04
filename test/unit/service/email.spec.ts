import { INVOICE_RESULT_LIST } from "../../@mock/invoice/result.mock";
import { TEST_MODULES } from "../../module/app.factory";

describe("[EMAIL] - SERVICE", () => {
  it("[UNIT] | [EMAIL] - [SERVICE] > created with correct dependencies", () => {
    const module = TEST_MODULES.APPLICATION.SERVICE.EMAIL.SIMULATE();

    expect(module.service).toBeDefined();
    expect(module.use_case).toBeDefined();
  });

  it("[UNIT] | [EMAIL] - CALLS > [USE CASE] ", async () => {
    const module = TEST_MODULES.APPLICATION.SERVICE.EMAIL.SIMULATE();

    module.use_case.execute.mockResolvedValue(undefined);

    await module.service.sendInvoices(INVOICE_RESULT_LIST);

    expect(module.use_case.execute).toHaveBeenCalledWith(INVOICE_RESULT_LIST);
  });
});
