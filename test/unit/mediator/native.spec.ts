import "reflect-metadata";
import { NativeMediator } from "../../../src/@modules/infra/mediator/native/native.mediator";

describe("[NATIVE] - [MEDIATOR]", () => {
  let mediator: NativeMediator;

  beforeEach(() => {
    mediator = new NativeMediator();
  });

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  it("[UNIT] | [MEDIATOR] - created with empty observers array", () => {
    expect(mediator.observers).toEqual([]);
    expect(mediator.observers).toHaveLength(0);
  });

  // ============================================================================
  // on - Register Observer
  // ============================================================================

  it("[UNIT] | [MEDIATOR] - on > registers observer with event and callback", async () => {
    const callback = jest.fn();

    await (mediator as any).on("TEST_EVENT", callback);

    expect(mediator.observers).toHaveLength(1);
    expect(mediator.observers[0].event).toBe("TEST_EVENT");
    expect(mediator.observers[0].callback).toBe(callback);
  });

  it("[UNIT] | [MEDIATOR] - on > registers multiple observers", async () => {
    const cb1 = jest.fn();
    const cb2 = jest.fn();

    await (mediator as any).on("EVENT_A", cb1);
    await (mediator as any).on("EVENT_B", cb2);

    expect(mediator.observers).toHaveLength(2);
  });

  it("[UNIT] | [MEDIATOR] - on > registers multiple observers for same event", async () => {
    const cb1 = jest.fn();
    const cb2 = jest.fn();

    await (mediator as any).on("SAME_EVENT", cb1);
    await (mediator as any).on("SAME_EVENT", cb2);

    expect(mediator.observers).toHaveLength(2);
    expect(mediator.observers.every((o) => o.event === "SAME_EVENT")).toBe(
      true,
    );
  });

  // ============================================================================
  // publish - Trigger Observers
  // ============================================================================

  it("[UNIT] | [MEDIATOR] - publish > triggers matching observer callback", async () => {
    const callback = jest.fn().mockResolvedValue(undefined);

    await (mediator as any).on("INVOICE_GENERATED", callback);
    await mediator.publish("INVOICE_GENERATED", { amount: 100 });

    expect(callback).toHaveBeenCalledWith({ amount: 100 });
  });

  it("[UNIT] | [MEDIATOR] - publish > does NOT trigger observer for different event", async () => {
    const callback = jest.fn();

    await (mediator as any).on("EVENT_A", callback);
    await mediator.publish("EVENT_B", { data: "test" });

    expect(callback).not.toHaveBeenCalled();
  });

  it("[UNIT] | [MEDIATOR] - publish > triggers only matching observer when multiple registered", async () => {
    const cbA = jest.fn().mockResolvedValue(undefined);
    const cbB = jest.fn().mockResolvedValue(undefined);

    await (mediator as any).on("EVENT_A", cbA);
    await (mediator as any).on("EVENT_B", cbB);

    await mediator.publish("EVENT_A", "payload");

    expect(cbA).toHaveBeenCalledWith("payload");
    expect(cbB).not.toHaveBeenCalled();
  });

  it("[UNIT] | [MEDIATOR] - publish > triggers all matching observers for same event", async () => {
    const cb1 = jest.fn().mockResolvedValue(undefined);
    const cb2 = jest.fn().mockResolvedValue(undefined);

    await (mediator as any).on("SHARED_EVENT", cb1);
    await (mediator as any).on("SHARED_EVENT", cb2);

    await mediator.publish("SHARED_EVENT", "data");

    expect(cb1).toHaveBeenCalledWith("data");
    expect(cb2).toHaveBeenCalledWith("data");
  });

  it("[UNIT] | [MEDIATOR] - publish > does nothing when no observers registered", async () => {
    // Should not throw even with no observers
    await expect(mediator.publish("ANY_EVENT", {})).resolves.not.toThrow();
  });

  it("[UNIT] | [MEDIATOR] - publish > passes data correctly to callback", async () => {
    const receivedData: any[] = [];
    const callback = jest.fn().mockImplementation(async (data) => {
      receivedData.push(data);
    });

    await (mediator as any).on("DATA_EVENT", callback);
    await mediator.publish("DATA_EVENT", [
      { date: "2026-01-01", amount: 5000 },
    ]);

    expect(receivedData[0]).toEqual([{ date: "2026-01-01", amount: 5000 }]);
  });
});
