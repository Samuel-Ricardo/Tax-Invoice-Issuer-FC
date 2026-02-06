import { preserveMetadata } from "../../@utils/decorator/metadata.util";
import { ErroLogInput, LogInput } from "../../@types/decorator/log/input.type";

interface _AsyncLoggable {
  log: (input: LogInput, ...data: any[]) => Promise<any> | Promise<void>;

  error: (input: ErroLogInput, ...data: any[]) => Promise<any> | Promise<void>;
  info: (input: LogInput, ...data: any[]) => Promise<any> | Promise<void>;
  warn: (input: LogInput, ...data: any[]) => Promise<any> | Promise<void>;
}

export abstract class LoggableAsync {
  log!: _AsyncLoggable["log"];

  error!: _AsyncLoggable["error"];
  info!: _AsyncLoggable["info"];
  warn!: _AsyncLoggable["warn"];
}

export function AsyncLogger(): ClassDecorator {
  return ((Base: new (...args: any[]) => any) => {
    const LoggerClass = class extends Base implements _AsyncLoggable {
      async info({ context, message }: LogInput, ...data: any[]) {
        console.info(`[${context}] | ${message}`, ...data);
      }

      async warn({ context, message }: LogInput, ...data: any[]) {
        console.warn(`[${context}] | ${message}`, ...data);
      }

      async error({ context, message, error }: ErroLogInput, ...data: any[]) {
        console.error(`[${context}] | ${message} `, error, ...data);
      }

      async log({ context, message }: LogInput, ...data: any[]) {
        console.log(`[${context}] | ${message}`, ...data);
      }
    };

    preserveMetadata(Base, LoggerClass);

    return LoggerClass;
  }) as ClassDecorator;
}
