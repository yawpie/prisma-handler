export interface Logger {
  info(msg: string, meta?: any): void;
  error(msg: string, meta?: any): void;
}
export class LoggerClass implements Logger {
  info(msg: string, meta?: any): void {
    console.log(`[INFO] ${msg}`, meta ?? "");
  }
  error(msg: string, meta?: any): void {
    console.error(`[ERROR] ${msg}`, meta ?? "");
  }
}