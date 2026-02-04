import "reflect-metadata";
import { MODULES } from "./@modules/app.factory";

MODULES.INFRA.SERVER.HTTP.EXPRESS().listen();
