import { TEST_MODULES } from "../../module/app.factory";
import { INVOICE_GENERATE_VALID_INPUT } from "../../@mock/invoice/generate.mock";
import {
  INVOICE_RESULT_LIST,
  INVOICE_RESULT_PRESENTED,
} from "../../@mock/invoice/result.mock";

describe("[INVOICE] - CONTROLLER", () => {
  it("[UNIT] | [INVOICE] - [CONTROLLER] > created with correct dependencies", () => {
    const module = TEST_MODULES.APPLICATION.CONTROLLER.INVOICE.SIMULATE();

    expect(module.controller).toBeDefined();
    expect(module.server).toBeDefined();
    expect(module.presenter).toBeDefined();
    expect(module.service).toBeDefined();
    expect(module.specification).toBeDefined();
  });

  it("[UNIT] | [INVOICE] - REGISTERS > [ROUTES]", async () => {
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

  it("[UNIT] | [INVOICE] - CALLS > [SERVICE] & [PRESENTER]", async () => {
    const module = TEST_MODULES.APPLICATION.CONTROLLER.INVOICE.SIMULATE();

    module.specification.isSatisfiedBy.mockReturnValue(true);
    module.service.generate.mockResolvedValue(INVOICE_RESULT_LIST);
    module.presenter.present.mockReturnValue(INVOICE_RESULT_PRESENTED);

    await module.controller.setup();

    const postCall = module.server.on.mock.calls.find(
      (call) => call[0] === "post" && call[1] === "/invoice",
    );
    const generateCallback = postCall![2];

    const result = await generateCallback({}, INVOICE_GENERATE_VALID_INPUT, {
      "content-type": "application/json",
    });

    expect(module.service.generate).toHaveBeenCalledWith(
      INVOICE_GENERATE_VALID_INPUT,
    );
    expect(module.presenter.present).toHaveBeenCalledWith(INVOICE_RESULT_LIST);
    expect(result).toBe(INVOICE_RESULT_PRESENTED);
  });

  it("[UNIT] | [INVOICE] - VALIDATES > [INPUT] VIA [SPECIFICATION]", async () => {
    const module = TEST_MODULES.APPLICATION.CONTROLLER.INVOICE.SIMULATE();

    module.service.generate.mockClear();
    module.specification.isSatisfiedBy.mockImplementation(() => {
      throw new Error("Invalid input");
    });

    await module.controller.setup();

    const postCall = module.server.on.mock.calls.find(
      (call) => call[0] === "post" && call[1] === "/invoice",
    );
    const generateCallback = postCall![2];

    await expect(
      generateCallback({}, { month: "invalid" }, {}),
    ).rejects.toThrow("Invalid input");

    expect(module.service.generate).not.toHaveBeenCalled();
  });

  it("[UNIT] | [INVOICE] - GENERATE > start calls server.listen", async () => {
    const module = TEST_MODULES.APPLICATION.CONTROLLER.INVOICE.SIMULATE();

    await module.controller.start();

    expect(module.server.listen).toHaveBeenCalled();
  });
});
