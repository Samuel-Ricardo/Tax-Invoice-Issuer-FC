import { Observer } from "../../../../@types/mediator/observer.type";
import { Mediator } from "../mediator.interface";

export class NativeMediator implements Mediator {
  observers: Observer[] = [];

  on(event: string, callback: Function): void {
    this.observers.push({ event, callback });
  }
}
