import { json } from "express";
import { mockDeep } from "jest-mock-extended";

const a = json();
type Tjson = typeof a;
export const MOCK_JSON_PARSER_ENGINE = mockDeep<Tjson>();
