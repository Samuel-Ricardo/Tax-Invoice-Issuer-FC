import cors from "cors";
import { mockDeep } from "jest-mock-extended";

const _cors = cors({ origin: "*" });
export const MOCK_CORS_ENGINE = mockDeep<typeof _cors>();
