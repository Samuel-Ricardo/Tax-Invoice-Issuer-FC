import { InputLogger } from "../../../../@decorators/log/data.decorator";
import { Observer } from "../../../../@types/mediator/observer.type";
import { Mediator } from "../mediator.interface";

export class NativeMediator implements Mediator {
  observers: Observer[] = [];

  @InputLogger({ context: "MEDIATOR", message: "ON" })
  on(event: string, callback: Function) {
    this.observers.push({ event, callback });
  }

  @InputLogger({ context: "MEDIATOR", message: "PUBLISH" })
  async publish(event: string, data: any) {
    this.observers.forEach(
      async (observer) =>
        observer.event === event && (await observer.callback(data)),
    );
  }
}
