import { inject, injectable } from "inversify";
import { HttpServer } from "../http.server";
import { TExpress } from "../../../../../@types/engine/server/http/express.type";
import { MODULE } from "../../../../app.registry";
import { HttpMethod } from "../../../../../@types/http/methods.type";
import {
  AsyncLogger,
  LoggableAsync,
} from "../../../../../@decorators/async/logger.decorator";
import { ServerCallback } from "../../../../../@types/http/callback.type";

@AsyncLogger()
@injectable()
export class ExpressServerAdapter extends LoggableAsync implements HttpServer {
  @inject(MODULE.INFRA.ENGINE.SERVER.HTTP.EXPRESS._)
  private readonly server: TExpress;

  on(method: HttpMethod, url: string, callback: ServerCallback): void {
    this.server[method](url, async function (req, res) {
      const output = await callback(req.params, req.body, req.headers);
      res.json(output);
    });
  }

  listen(p: number = 3000): void {
    this.info({
      context: "SERVER",
      message: `Listening on http://localhost:${p}`,
    });
    this.server.listen(p);
  }
}
