import { Mediator } from "../../src/@modules/infra/mediator/mediator.interface";

export class MockMediator implements Mediator {
  private observers: { event: string; callback: Function }[] = [];
  public publishedEvents: { event: string; data: any }[] = [];

  on(event: string, callback: Function): void {
    this.observers.push({ event, callback });
  }

  async publish(event: string, data: any): Promise<void> {
    this.publishedEvents.push({ event, data });
    for (const observer of this.observers) {
      if (observer.event === event) {
        await observer.callback(data);
      }
    }
  }

  getPublishedEvents(event?: string) {
    if (event) {
      return this.publishedEvents.filter((e) => e.event === event);
    }
    return this.publishedEvents;
  }

  reset() {
    this.observers = [];
    this.publishedEvents = [];
  }
}
