import { Observer } from "../../../../@types/mediator/observer.type";
import { Mediator } from "../mediator.interface";

export class NativeMediator implements Mediator {
  observers: Observer[] = [];

  on(event: string, callback: Function) {
    this.observers.push({ event, callback });
  }

  async publish(event: string, data: any) {
    this.observers.forEach(
      async (observer) =>
        observer.event === event && (await observer.callback(data)),
    );
  }
}
