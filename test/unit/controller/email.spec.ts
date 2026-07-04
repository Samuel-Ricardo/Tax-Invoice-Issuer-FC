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

  it("[UNIT] | [EMAIL] - START > [DOES NOTHING]", async () => {
    const module = TEST_MODULES.APPLICATION.CONTROLLER.EMAIL.SIMULATE();

    module.mediator.on.mockClear();

    await module.controller.start();

    expect(module.mediator.on).not.toHaveBeenCalled();
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

  it("[UNIT] | [EMAIL] - CALLS > [SERVICE] when specification returns false (logs but proceeds)", async () => {
    const module = TEST_MODULES.APPLICATION.CONTROLLER.EMAIL.SIMULATE();

    module.specification.isSatisfiedBy.mockReturnValue(false);
    module.service.sendInvoices.mockResolvedValue(undefined);

    await module.controller.setup();

    const postCall = module.mediator.on.mock.calls.find(
      (call) => call[0] === module.events.INVOICE.GENERATED,
    );

    const generateCallback = postCall![1];

    const payload = [{ id: "inv-1" }];

    const result = await generateCallback(payload);

    expect(module.service.sendInvoices).toHaveBeenCalledWith(payload);
    expect(result).toBe(true);
  });

  it("[UNIT] | [EMAIL] - VALIDATES > throws when specification throws and service is NOT called", async () => {
    const module = TEST_MODULES.APPLICATION.CONTROLLER.EMAIL.SIMULATE();

    module.specification.isSatisfiedBy.mockImplementation(() => {
      throw new Error("Invalid input");
    });
    module.service.sendInvoices.mockClear();

    await module.controller.setup();

    const postCall = module.mediator.on.mock.calls.find(
      (call) => call[0] === module.events.INVOICE.GENERATED,
    );

    const generateCallback = postCall![1];

    await expect(generateCallback([{ id: "inv-1" }])).rejects.toThrow(
      "Invalid input",
    );

    expect(module.service.sendInvoices).not.toHaveBeenCalled();
  });

  it("[UNIT] | [EMAIL] - CALLS > propagates service errors", async () => {
    const module = TEST_MODULES.APPLICATION.CONTROLLER.EMAIL.SIMULATE();

    module.specification.isSatisfiedBy.mockReturnValue(true);
    module.service.sendInvoices.mockRejectedValue(new Error("send failed"));

    await module.controller.setup();

    const postCall = module.mediator.on.mock.calls.find(
      (call) => call[0] === module.events.INVOICE.GENERATED,
    );

    const generateCallback = postCall![1];

    await expect(generateCallback([{ id: "inv-1" }])).rejects.toThrow(
      "send failed",
    );

    expect(module.service.sendInvoices).toHaveBeenCalled();
  });
});
