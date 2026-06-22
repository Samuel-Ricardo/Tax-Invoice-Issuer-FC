import { TEST_MODULES } from "../../module/app.factory";

describe("[INVOICE] - CONTROLLER", () => {
  it("[UNIT] | Controller created with correct dependencies", () => {
    const module = TEST_MODULES.APPLICATION.CONTROLLER.INVOICE.SIMULATE();

    expect(module.controller).toBeDefined();
    expect(module.server).toBeDefined();
    expect(module.presenter).toBeDefined();
    expect(module.service).toBeDefined();
    expect(module.specification).toBeDefined();
  });
});
