import { CONTRACT_LIST_MOCK } from "../../../@mock/contract/list.mock";
import { PAYMENT_LIST_MOCK } from "../../../@mock/payment/list.mock";
import { TEST_MODULES } from "../../../module/app.factory";

describe("[CONTRACT] - [USE CASE] > [LIST]", () => {
  it("[UNIT] | [INVOICE] - [USE CASE] > created with correct dependencies", () => {
    const module = TEST_MODULES.APPLICATION.USE_CASE.CONTRACT.LIST.SIMULATE();

    expect(module?.use_case).toBeDefined();
    expect(module?.repository).toBeDefined();
  });

  it("[UNIT] | [INVOICE] - CALLS > [REPOSITORY] > [LIST]", async () => {
    const module = TEST_MODULES.APPLICATION.USE_CASE.CONTRACT.LIST.SIMULATE();

    module.repository.contract.list.mockResolvedValue(CONTRACT_LIST_MOCK);
    module.repository.payment.list.mockResolvedValue(PAYMENT_LIST_MOCK);

    const result = await module.use_case.execute();

    expect(module.repository.contract.list).toHaveBeenCalled();
    expect(module.repository.payment.list).toHaveBeenCalledTimes(
      CONTRACT_LIST_MOCK.length,
    );
    expect(result).toEqual(CONTRACT_LIST_MOCK);
  });
});
