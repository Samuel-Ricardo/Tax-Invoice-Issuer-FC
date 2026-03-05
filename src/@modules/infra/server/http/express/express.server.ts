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
import { Cors } from "../../../../../@types/engine/server/http/cors.type";
import { JsonParser } from "../../../../../@types/engine/server/http/parser/json.type";

@AsyncLogger()
@injectable()
export class ExpressServerAdapter extends LoggableAsync implements HttpServer {
  constructor(
    @inject(MODULE.INFRA.ENGINE.SERVER.HTTP.EXPRESS._)
    private readonly server: TExpress,
    @inject(MODULE.INFRA.ENGINE.SERVER.HTTP.EXPRESS.PARSER.JSON)
    private readonly parser: JsonParser,
    @inject(MODULE.INFRA.ENGINE.SERVER.HTTP.EXPRESS.CORS)
    private readonly cors: Cors,
  ) {
    super();
    this.setup();
  }

  on(method: HttpMethod, url: string, callback: ServerCallback): void {
    this.server[method](url, async function (req, res) {
      try {
        const output = await callback(req.params, req.body, req.headers);
        res.json(output);
      } catch (error: any) {
        res.status(400).json({
          error: error.message || "An error occurred",
          status: 400,
        });
      }
    });

    this.info({
      context: "SERVER",
      message: `Registered ${method.toUpperCase()} ${url}`,
    });
  }

  listen(p: number = 3000): void {
    this.info({
      context: "SERVER",
      message: `Listening on http://localhost:${p}`,
    });

    this.server.listen(p);
  }

  private setup(): void {
    this.server.use(this.cors);
    this.server.use(this.parser);
    this.info({ context: "SERVER", message: "Setup Express Server" });
  }
}
