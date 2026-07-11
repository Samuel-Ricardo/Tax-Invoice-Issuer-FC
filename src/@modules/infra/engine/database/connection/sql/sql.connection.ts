//INFO: PORT
export interface SQLDatabaseConnection {
  query(statement: string, params: any): Promise<any>;
  close(): Promise<void>;
}
