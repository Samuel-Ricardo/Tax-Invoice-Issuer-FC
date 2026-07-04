import { TEST_MODULES } from "../../module/app.factory";

describe("[EMAIL] - SERVICE", () => {
  it("[UNIT] | [EMAIL] - [SERVICE] > created with correct dependencies", () => {
    const module = TEST_MODULES.APPLICATION.SERVICE.EMAIL.SIMULATE();

    expect(module.service).toBeDefined();
    expect(module.use_case).toBeDefined();
  });
});
