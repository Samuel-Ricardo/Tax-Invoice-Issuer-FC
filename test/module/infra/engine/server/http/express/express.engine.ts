import express from "express";
import { mockDeep } from "jest-mock-extended";

const _express = express();
export const MOCK_EXPRESS_ENGINE = mockDeep<typeof _express>();
