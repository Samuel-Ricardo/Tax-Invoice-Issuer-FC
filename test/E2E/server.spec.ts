import "reflect-metadata";

import supertest from "supertest";
import { MODULES } from "../../src/app";
import { shutdownDatabase } from "../util/database.util";

describe("[E2E] | SERVER", () => {
  afterAll(async () => await shutdownDatabase());

  it("[E2E] | HEALTH CHECK", async () => {
    const response = await supertest(
      MODULES.INFRA.ENGINE.SERVER.HTTP.EXPRESS._(),
    ).get("/");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ hello: "world" });
  });
});
