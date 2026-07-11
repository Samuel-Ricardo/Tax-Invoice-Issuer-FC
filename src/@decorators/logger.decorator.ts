import { preserveMetadata } from "../@utils/decorator/metadata.util";
import { ErroLogInput, LogInput } from "../@types/decorator/log/input.type";

interface _Loggable {
  log: (input: LogInput, ...data: any[]) => void | any;

  error: (input: ErroLogInput, ...data: any[]) => void | any;
  info: (input: LogInput, ...data: any[]) => void | any;
  warn: (input: LogInput, ...data: any[]) => void | any;
}

export abstract class Loggable {
  log!: _Loggable["log"];

  error!: _Loggable["error"];
  info!: _Loggable["info"];
  warn!: _Loggable["warn"];
}

export function Logger(): ClassDecorator {
  return ((Base: new (...args: any[]) => any) => {
    const LoggerClass = class extends Base implements _Loggable {
      info({ context, message }: LogInput, ...data: any[]) {
        console.info(`[${context}] | ${message}`, ...data);
      }

      warn({ context, message }: LogInput, ...data: any[]) {
        console.warn(`[${context}] | ${message}`, ...data);
      }

      error({ context, message, error }: ErroLogInput, ...data: any[]) {
        console.error(`[${context}] | ${message} `, error, ...data);
      }

      log({ context, message }: LogInput, ...data: any[]) {
        console.log(`[${context}] | ${message}`, ...data);
      }
    };

    preserveMetadata(Base, LoggerClass);

    return LoggerClass;
  }) as ClassDecorator;
}
