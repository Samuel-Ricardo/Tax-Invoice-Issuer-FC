import { mockDeep } from "jest-mock-extended";
import { ZodValidator } from "../../../../../src/@modules/infra/validator/zod/zod.validator";
import { ResolutionContext } from "inversify";
import { TEST_MODULE } from "../../../app.registry";

export const mockZodValidator = mockDeep<ZodValidator<any>>();

export const simulateZodValidator = (a: ResolutionContext) => {
  return new ZodValidator(a.get(TEST_MODULE.INFRA.ENGINE.VALIDATION.ZOD));
};
