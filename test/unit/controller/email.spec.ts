import { TEST_MODULES } from "../../module/app.factory";

describe("[EMAIL] - CONTROLLER", () => {
  it("[UNIT] | [EMAIL] - [CONTROLLER] > created with correct dependencies", () => {
    const module = TEST_MODULES.APPLICATION.CONTROLLER.EMAIL.SIMULATE();

    expect(module.controller).toBeDefined();
    expect(module.events).toBeDefined();
    expect(module.mediator).toBeDefined();
    expect(module.service).toBeDefined();
    expect(module.specification).toBeDefined();
  });

  it("[UNIT] | [EMAIL] - REGISTERS > [ROUTES]", async () => {
    const module = TEST_MODULES.APPLICATION.CONTROLLER.EMAIL.SIMULATE();

    await module.controller.setup();

    expect(module.mediator.on).toHaveBeenCalledWith(
      module.events.INVOICE.GENERATED,
      expect.any(Function),
    );
  });
});
