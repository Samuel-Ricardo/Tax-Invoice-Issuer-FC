import "reflect-metadata";

import supertest from "supertest";
import { MODULES } from "../../src/app";

describe("[E2E] | SERVER", () => {
  it("[E2E] | HEALTH CHECK", async () => {
    const response = await supertest(
      MODULES.INFRA.ENGINE.SERVER.HTTP.EXPRESS._(),
    ).get("/");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ hello: "world" });
  });
});
