import { ServerCallback } from "../../../../@types/http/callback.type";
import { HttpMethod } from "../../../../@types/http/methods.type";

//INFO: PORT - ADAPTER
export interface HttpServer {
  on(method: HttpMethod, url: string, callback: ServerCallback): void;
  listen(port?: number): void;
}
