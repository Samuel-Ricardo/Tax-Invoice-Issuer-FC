import { ErroLogInput, LogInput } from "../@types/decorator/log/input.type";

export const log = {
  info({ context, message }: LogInput, ...data: any[]) {
    console.info(`[${context}] | ${message}`, ...data);
  },

  warn({ context, message }: LogInput, ...data: any[]) {
    console.warn(`[${context}] | ${message}`, ...data);
  },

  error({ context, message, error }: ErroLogInput, ...data: any[]) {
    console.error(`[${context}] | ${message} `, error, ...data);
  },

  log({ context, message }: LogInput, ...data: any[]) {
    console.log(`[${context}] | ${message}`, ...data);
  },
};
