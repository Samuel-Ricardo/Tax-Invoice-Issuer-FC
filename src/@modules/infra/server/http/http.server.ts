import { HttpMethod } from "../../../../@types/http/methods.type";

//INFO: PORT - ADAPTER
export interface HttpServer {
  on(method: HttpMethod, url: string, callback: Function): void;
  listen(port?: number): void;
}
