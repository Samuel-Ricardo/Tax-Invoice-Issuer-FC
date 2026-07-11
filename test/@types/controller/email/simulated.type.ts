import { DeepMockProxy } from "jest-mock-extended";
import { EmailController } from "../../../../src/@modules/application/controller/email/email.controller";
import { Mediator } from "../../../module/infra/mediator/mediator.interface";
import { Events } from "../../../../src/@types/config/events.type";
import { EmailService } from "../../../../src/@modules/domain/service/email/email.service";
import { EmailSpecificationZod } from "../../../../src/@modules/application/specificaiton/zod/email.specification";

export interface SimulatedEmailController {
  controller: EmailController;
  mediator: DeepMockProxy<Mediator>;
  events: DeepMockProxy<Events>;
  service: DeepMockProxy<EmailService>;
  specification: DeepMockProxy<EmailSpecificationZod>;
}
