import "reflect-metadata";

import supertest from "supertest";
import { MODULES } from "../../src/app";

describe("[E2E] | SERVER", () => {
  it("[E2E] | GENERATE [INVOICE]", async () => {
    const response = await supertest(
      MODULES.INFRA.ENGINE.SERVER.HTTP.EXPRESS._(),
    ).get("/invoice");

    expect(response.status).toBe(200);
  });
});
