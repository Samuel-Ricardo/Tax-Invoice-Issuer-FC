import "reflect-metadata";
import { TEST_MODULES } from "../../module/app.factory";

describe("[EXPRESS] - [SERVER ADAPTER]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // on - Route Registration
  // ============================================================================

  it("[UNIT] | [EXPRESS] - on > registers route on express engine", async () => {
    const adapter =
      TEST_MODULES.INFRA.SERVER.SERVER.HTTP.EXPRESS.SIMULATE() as any;
    const mockServer = TEST_MODULES.INFRA.ENGINE.SERVER.HTTP.EXPRESS._();

    const callback = jest.fn().mockResolvedValue({ hello: "world" });

    adapter.on("get", "/test", callback);

    expect(mockServer.get).toHaveBeenCalledWith("/test", expect.any(Function));
  });

  it("[UNIT] | [EXPRESS] - on > registers POST route", async () => {
    const adapter =
      TEST_MODULES.INFRA.SERVER.SERVER.HTTP.EXPRESS.SIMULATE() as any;
    const mockServer = TEST_MODULES.INFRA.ENGINE.SERVER.HTTP.EXPRESS._();

    adapter.on("post", "/invoice", jest.fn());

    expect(mockServer.post).toHaveBeenCalledWith(
      "/invoice",
      expect.any(Function),
    );
  });

  it("[UNIT] | [EXPRESS] - on > route handler calls callback and returns json response", async () => {
    const adapter =
      TEST_MODULES.INFRA.SERVER.SERVER.HTTP.EXPRESS.SIMULATE() as any;
    const mockServer = TEST_MODULES.INFRA.ENGINE.SERVER.HTTP.EXPRESS._();

    const expectedResult = { invoices: [] };
    const callback = jest.fn().mockResolvedValue(expectedResult);

    adapter.on("post", "/invoice", callback);

    // Get the registered handler function
    const registeredHandler = (mockServer.post as jest.Mock).mock.calls[0][1];
    const mockReq = { params: {}, body: { month: 1 }, headers: {} };
    const mockRes = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await registeredHandler(mockReq, mockRes);

    expect(callback).toHaveBeenCalledWith({}, { month: 1 }, {});
    expect(mockRes.json).toHaveBeenCalledWith(expectedResult);
  });

  it("[UNIT] | [EXPRESS] - on > route handler returns 400 when callback throws with message", async () => {
    const adapter =
      TEST_MODULES.INFRA.SERVER.SERVER.HTTP.EXPRESS.SIMULATE() as any;
    const mockServer = TEST_MODULES.INFRA.ENGINE.SERVER.HTTP.EXPRESS._();

    const callback = jest
      .fn()
      .mockRejectedValue(new Error("Validation failed"));

    adapter.on("post", "/invoice", callback);

    const registeredHandler = (mockServer.post as jest.Mock).mock.calls[0][1];
    const mockReq = { params: {}, body: {}, headers: {} };
    const mockRes = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await registeredHandler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Validation failed",
      status: 400,
    });
  });

  it("[UNIT] | [EXPRESS] - on > route handler returns 400 with default message when error has no message", async () => {
    const adapter =
      TEST_MODULES.INFRA.SERVER.SERVER.HTTP.EXPRESS.SIMULATE() as any;
    const mockServer = TEST_MODULES.INFRA.ENGINE.SERVER.HTTP.EXPRESS._();

    const errorWithoutMessage = Object.assign(new Error(), {
      message: undefined,
    });
    const callback = jest.fn().mockRejectedValue(errorWithoutMessage);

    adapter.on("post", "/invoice", callback);

    const registeredHandler = (mockServer.post as jest.Mock).mock.calls[0][1];
    const mockReq = { params: {}, body: {}, headers: {} };
    const mockRes = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await registeredHandler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "An error occurred",
      status: 400,
    });
  });

  // ============================================================================
  // listen - Server Start
  // ============================================================================

  it("[UNIT] | [EXPRESS] - listen > calls server.listen with provided port", () => {
    const adapter =
      TEST_MODULES.INFRA.SERVER.SERVER.HTTP.EXPRESS.SIMULATE() as any;
    const mockServer = TEST_MODULES.INFRA.ENGINE.SERVER.HTTP.EXPRESS._();

    adapter.listen(4000);

    expect(mockServer.listen).toHaveBeenCalledWith(4000);
  });

  it("[UNIT] | [EXPRESS] - listen > calls server.listen with default port 3000", () => {
    const adapter =
      TEST_MODULES.INFRA.SERVER.SERVER.HTTP.EXPRESS.SIMULATE() as any;
    const mockServer = TEST_MODULES.INFRA.ENGINE.SERVER.HTTP.EXPRESS._();

    adapter.listen();

    expect(mockServer.listen).toHaveBeenCalledWith(3000);
  });

  it("[UNIT] | [EXPRESS] - listen > calls server.listen with custom port", () => {
    const adapter =
      TEST_MODULES.INFRA.SERVER.SERVER.HTTP.EXPRESS.SIMULATE() as any;
    const mockServer = TEST_MODULES.INFRA.ENGINE.SERVER.HTTP.EXPRESS._();

    adapter.listen(8080);

    expect(mockServer.listen).toHaveBeenCalledWith(8080);
  });
});
