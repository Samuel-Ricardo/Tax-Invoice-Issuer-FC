export interface HttpServer {
  on(
    method: "post" | "get" | "put" | "delete",
    url: string,
    callback: Function,
  ): void;
  listen(port?: number): void;
}
