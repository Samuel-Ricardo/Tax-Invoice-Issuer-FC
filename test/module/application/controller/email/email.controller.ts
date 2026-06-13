import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { EmailController } from "../../../../../src/@modules/application/controller/email/email.controller";
import { ResolutionContext } from "inversify";
import { TEST_MODULE } from "../../../app.registry";
import { Mediator } from "../../../infra/mediator/mediator.interface";
import { Events } from "../../../../../src/@types/config/events.type";
import { EmailService } from "../../../../../src/@modules/domain/service/email/email.service";
import { EmailSpecificationZod } from "../../../../../src/@modules/application/specificaiton/zod/email.specification";

export const mockNativeEmailController = mockDeep<EmailController>();

export const simulateNativeEmailController = (module: ResolutionContext) => {
  const mediator = module.get<DeepMockProxy<Mediator>>(
    TEST_MODULE.INFRA.MEDIATOR.NATIVE,
  );
  const events = module.get<DeepMockProxy<Events>>(
    TEST_MODULE.INFRA.CONFIG.EVENT.S,
  );
  const service = module.get<DeepMockProxy<EmailService>>(
    TEST_MODULE.APPLICATION.SERVICE.EMAIL.MOCK,
  );
  const specification = module.get<DeepMockProxy<EmailSpecificationZod>>(
    TEST_MODULE.APPLICATION.SPECIFICATION.ZOD.EMAIL.MOCK,
  );

  const controller = new EmailController(
    mediator,
    events,
    service,
    specification,
  );

  return { controller, mediator, events, service, specification };
};
