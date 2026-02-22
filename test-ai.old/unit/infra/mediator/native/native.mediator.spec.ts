import { NativeMediator } from "../../../../../src/@modules/infra/mediator/native/native.mediator";

describe("[UNIT] Mediator - Native", () => {
  let mediator: NativeMediator;

  beforeEach(() => {
    mediator = new NativeMediator();
  });

  describe("on", () => {
    test("Should register an observer", () => {
      const callback = jest.fn();

      mediator.on("TEST_EVENT", callback);

      expect(mediator.observers).toHaveLength(1);
      expect(mediator.observers[0]).toEqual({
        event: "TEST_EVENT",
        callback,
      });
    });

    test("Should register multiple observers", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const callback3 = jest.fn();

      mediator.on("EVENT_1", callback1);
      mediator.on("EVENT_2", callback2);
      mediator.on("EVENT_3", callback3);

      expect(mediator.observers).toHaveLength(3);
    });

    test("Should allow multiple observers for same event", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      mediator.on("SAME_EVENT", callback1);
      mediator.on("SAME_EVENT", callback2);

      expect(mediator.observers).toHaveLength(2);
      expect(mediator.observers[0].event).toBe("SAME_EVENT");
      expect(mediator.observers[1].event).toBe("SAME_EVENT");
    });
  });

  describe("publish", () => {
    test("Should notify observers of matching event", async () => {
      const callback = jest.fn();
      mediator.on("TEST_EVENT", callback);

      await mediator.publish("TEST_EVENT", { data: "test" });

      expect(callback).toHaveBeenCalledWith({ data: "test" });
      expect(callback).toHaveBeenCalledTimes(1);
    });

    test("Should not notify observers of different event", async () => {
      const callback = jest.fn();
      mediator.on("EVENT_A", callback);

      await mediator.publish("EVENT_B", { data: "test" });

      expect(callback).not.toHaveBeenCalled();
    });

    test("Should notify all observers of same event", async () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const callback3 = jest.fn();

      mediator.on("BROADCAST", callback1);
      mediator.on("BROADCAST", callback2);
      mediator.on("BROADCAST", callback3);

      await mediator.publish("BROADCAST", { message: "hello" });

      expect(callback1).toHaveBeenCalledWith({ message: "hello" });
      expect(callback2).toHaveBeenCalledWith({ message: "hello" });
      expect(callback3).toHaveBeenCalledWith({ message: "hello" });
    });

    test("Should handle async callbacks", async () => {
      const asyncCallback = jest.fn().mockResolvedValue("done");
      mediator.on("ASYNC_EVENT", asyncCallback);

      await mediator.publish("ASYNC_EVENT", { async: true });

      expect(asyncCallback).toHaveBeenCalled();
    });

    test("Should publish without observers", async () => {
      await expect(
        mediator.publish("NO_OBSERVERS", { data: "test" }),
      ).resolves.not.toThrow();
    });

    test("Should handle null data", async () => {
      const callback = jest.fn();
      mediator.on("NULL_EVENT", callback);

      await mediator.publish("NULL_EVENT", null);

      expect(callback).toHaveBeenCalledWith(null);
    });

    test("Should handle undefined data", async () => {
      const callback = jest.fn();
      mediator.on("UNDEFINED_EVENT", callback);

      await mediator.publish("UNDEFINED_EVENT", undefined);

      expect(callback).toHaveBeenCalledWith(undefined);
    });

    test("Should handle complex data objects", async () => {
      const callback = jest.fn();
      mediator.on("COMPLEX_EVENT", callback);

      const complexData = {
        id: 1,
        nested: {
          array: [1, 2, 3],
          object: { key: "value" },
        },
      };

      await mediator.publish("COMPLEX_EVENT", complexData);

      expect(callback).toHaveBeenCalledWith(complexData);
    });

    test("Should publish multiple times", async () => {
      const callback = jest.fn();
      mediator.on("REPEAT_EVENT", callback);

      await mediator.publish("REPEAT_EVENT", { count: 1 });
      await mediator.publish("REPEAT_EVENT", { count: 2 });
      await mediator.publish("REPEAT_EVENT", { count: 3 });

      expect(callback).toHaveBeenCalledTimes(3);
    });
  });

  describe("Integration", () => {
    test("Should support event-driven architecture", async () => {
      const eventLog: string[] = [];

      mediator.on("ORDER_CREATED", async () => {
        eventLog.push("send_email");
      });

      mediator.on("ORDER_CREATED", async () => {
        eventLog.push("update_inventory");
      });

      mediator.on("ORDER_CREATED", async () => {
        eventLog.push("notify_shipping");
      });

      await mediator.publish("ORDER_CREATED", { orderId: "123" });

      expect(eventLog).toHaveLength(3);
      expect(eventLog).toContain("send_email");
      expect(eventLog).toContain("update_inventory");
      expect(eventLog).toContain("notify_shipping");
    });
  });
});
