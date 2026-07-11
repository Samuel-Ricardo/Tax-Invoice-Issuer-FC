import { mockDeep } from "jest-mock-extended";
import { z } from "zod";

type zod = typeof z;

export const MOCK_ZOD_ENGINE = mockDeep<zod>();
