export type ServerCallback = (
  params: any,
  body: any,
  headers: any,
) => Promise<any>;
