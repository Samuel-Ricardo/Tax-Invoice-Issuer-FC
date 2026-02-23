import "reflect-metadata";
import { MODULES } from "./@modules/app.factory";

const invoice = MODULES.APPLICATION.CONTROLLER.INVOICE();

invoice.setup();

const SERVER = invoice;

export { SERVER, MODULES };
