export type LogInput = { context: string; message?: string };
export type ErroLogInput = {
  context: string;
  message: string;
  error?: Error;
};
