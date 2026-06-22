import { TEST_MODULES } from "../../module/app.factory";
import { Invoice } from "../../../src/@modules/domain/entity/invoice.entity";
import { INVOICE_GENERATE_VALID_INPUT } from "../../@mock/invoice/generate.mock";

describe("[INVOICE] - CONTROLLER", () => {
  it("[UNIT] | Controller created with correct dependencies", () => {
    const module = TEST_MODULES.APPLICATION.CONTROLLER.INVOICE.SIMULATE();

    expect(module.controller).toBeDefined();
    expect(module.server).toBeDefined();
    expect(module.presenter).toBeDefined();
    expect(module.service).toBeDefined();
    expect(module.specification).toBeDefined();
  });

  it("[UNIT] | INVOICE - REGISTERS > [ROUTES]", async () => {
    const module = TEST_MODULES.APPLICATION.CONTROLLER.INVOICE.SIMULATE();

    await module.controller.setup();

    expect(module.server.on).toHaveBeenCalledWith(
      "post",
      "/invoice",
      expect.any(Function),
    );

    expect(module.server.on).toHaveBeenCalledWith(
      "get",
      "/",
      expect.any(Function),
    );
  });

  it("[UNIT] | INVOICE - CALLS > [SERVICE] & [PRESENTER]", async () => {
    const module = TEST_MODULES.APPLICATION.CONTROLLER.INVOICE.SIMULATE();

    const fakeInvoices = [
      new Invoice(new Date("2026-06-01"), 5000),
      new Invoice(new Date("2026-06-15"), 3000),
    ];
    const fakePresentedData = JSON.stringify(fakeInvoices);

    module.specification.isSatisfiedBy.mockReturnValue(true);
    module.service.generate.mockResolvedValue(fakeInvoices);
    module.presenter.present.mockReturnValue(fakePresentedData);

    await module.controller.setup();

    // Extract the registered callback from server.on mock
    const postCall = module.server.on.mock.calls.find(
      (call) => call[0] === "post" && call[1] === "/invoice",
    );
    const generateCallback = postCall![2];

    // Invoke the callback (simulates HTTP request arriving)
    const result = await generateCallback({}, INVOICE_GENERATE_VALID_INPUT, {
      "content-type": "application/json",
    });

    expect(module.service.generate).toHaveBeenCalledWith(
      INVOICE_GENERATE_VALID_INPUT,
    );
    expect(module.presenter.present).toHaveBeenCalledWith(fakeInvoices);
    expect(result).toBe(fakePresentedData);
  });
});
