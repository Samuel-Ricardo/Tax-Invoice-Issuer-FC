import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { EmailController } from "../../../../../src/@modules/application/controller/email/email.controller";
import { ResolutionContext } from "inversify";
import { TEST_MODULE } from "../../../app.registry";
import { Mediator } from "../../../infra/mediator/mediator.interface";

export const mockNativeEmailController = mockDeep<EmailController>();

export const simulateNativeEmailController = (module: ResolutionContext) => {
  const mediator = module.get<DeepMockProxy<Mediator>>(
    TEST_MODULE.INFRA.MEDIATOR.NATIVE,
  );
  const events = module.get<DeepMockProxy<Events>>(
    TEST_MODULE.INFRA.CONFIG.EVENT.S,
  );
  const service = module.get<DeepMockProxy<EmailService>>(
    TEST_MODULE.APPLICATION.SERVICE.EMAIL,
  );
  const specification = module.get<DeepMockProxy<Specification<Invoice>>>(
    TEST_MODULE.APPLICATION.SPECIFICATION.ZOD.EMAIL,
  );

  const controller = new EmailController(mediator);

  return { controller, mediator };
};
