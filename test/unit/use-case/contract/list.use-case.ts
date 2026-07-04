import { TEST_MODULES } from "../../../module/app.factory";

describe("[CONTRACT] - [USE CASE] > [LIST]", () => {
  it("[UNIT] | [INVOICE] - [USE CASE] > created with correct dependencies", () => {
    const module =
      TEST_MODULES.APPLICATION.USE_CASE.CONTRACT.LIST.SIMULATE() as any;

    expect(module?.use_case).toBeDefined();
    expect(module?.repository).toBeDefined();
  });
});
