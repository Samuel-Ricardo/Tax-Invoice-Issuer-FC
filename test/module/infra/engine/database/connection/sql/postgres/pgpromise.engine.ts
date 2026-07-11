import { mockDeep } from "jest-mock-extended";
import { PgPromiseConnectionAdapter } from "../../../../../../../../src/@modules/infra/engine/database/connection/sql/postgres/pgpromise.engine";

export const mockPgPromiseConnection = () =>
  mockDeep<PgPromiseConnectionAdapter>();
