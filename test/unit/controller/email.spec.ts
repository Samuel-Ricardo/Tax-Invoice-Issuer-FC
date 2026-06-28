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

  it("[UNIT] | [EMAIL] - CALLS > [SERVICE] ", async () => {
    const module = TEST_MODULES.APPLICATION.CONTROLLER.EMAIL.SIMULATE();

    module.specification.isSatisfiedBy.mockReturnValue(true);
    module.service.sendInvoices.mockResolvedValue(undefined);

    await module.controller.setup();

    const postCall = module.mediator.on.mock.calls.find(
      (call) => call[0] === module.events.INVOICE.GENERATED,
    );

    const generateCallback = postCall![1];

    const result = await generateCallback({});

    expect(module.service.sendInvoices).toHaveBeenCalled();
    expect(result).toBe(true);
  });
});
