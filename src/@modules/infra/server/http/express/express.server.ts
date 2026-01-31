import { inject, injectable } from "inversify";
import { HttpServer } from "../http.server";
import { TExpress } from "../../../../../@types/engine/server/http/express.type";
import { MODULE } from "../../../../app.registry";

@injectable()
export class ExpressServerAdapter implements HttpServer {
  @inject(MODULE.INFRA.ENGINE.SERVER.HTTP.EXPRESS._)
  private readonly server: TExpress;

  on(
    method: "post" | "get" | "put" | "delete",
    url: string,
    callback: Function,
  ): void {
    this.server[method](url, async function (req, res) {
      const output = await callback(req.params, req.body, req.headers);
      res.json(output);
    });
  }

  listen(port?: number): void {
    port = port || 3000;
    console.log(`Listening on http://localhost:${port}`);
    this.server.listen(port);
  }
}
