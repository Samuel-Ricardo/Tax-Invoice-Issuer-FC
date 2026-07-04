import { TEST_MODULES } from "../../module/app.factory";

describe("[INVOICE] - [SERVICE]", () => {
  it("[UNIT] | [INVOICE] - [SERVICE] > created with correct dependencies", () => {
    const module = TEST_MODULES.APPLICATION.SERVICE.INVOICE.SIMULATE();

    expect(module.service).toBeDefined();
    expect(module.use_case.generate.invoice).toBeDefined();
    expect(module.use_case.list.contract).toBeDefined();
  });
});
