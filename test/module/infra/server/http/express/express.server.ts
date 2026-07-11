import { mockDeep } from "jest-mock-extended";
import { ExpressServerAdapter } from "../../../../../../src/@modules/infra/server/http/express/express.server";
import { ResolutionContext } from "inversify";
import { TEST_MODULE } from "../../../../app.registry";

export const mockExpressServerAdapter = mockDeep<ExpressServerAdapter>();

export const simulateExpressServerAdapter = (module: ResolutionContext) => {
  return new ExpressServerAdapter(
    module.get(TEST_MODULE.INFRA.ENGINE.SERVER.HTTP.EXPRESS._),
    module.get(TEST_MODULE.INFRA.ENGINE.SERVER.HTTP.EXPRESS.PARSER.JSON),
    module.get(TEST_MODULE.INFRA.ENGINE.SERVER.HTTP.EXPRESS.CORS),
  );
};
