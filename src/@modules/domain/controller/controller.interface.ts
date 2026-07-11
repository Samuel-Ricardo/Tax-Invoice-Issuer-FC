export interface Controller {
  setup(): Promise<any | void>;
  start(): Promise<any | void>;
}
