import { PrismaClient } from "@prisma/client";
import { Logger, LoggerClass } from "./logger";
import { handlePrismaWrite } from "./handlePrismaWrite";
import { handlePrismaNotFound } from "./handleNotFound";
// import {  } from "./error";

export function createPrismaUtils(
  prisma: PrismaClient,
  config?: {
    logger?: Logger;
  },
) {
  let logger: Logger = new LoggerClass();
  if (config) {
    logger = config.logger || logger;
  }

  /**
   * Handles Prisma write operations with error handling and logging.
   * @param fn function to execute
   * @param defaultErrorMessage default message for error
   * @param options additional options like traceId and operation name for logging
   * @return result of the function or throws an error with appropriate message and status code
   */
  const handleWrite = <T>(
    fn: () => Promise<T>,
    defaultErrorMessage?: string,
    options?: {
      traceId?: string;
      operation?: string;
    },
  ) => {
    logger.info("Prisma write operation started", {
      operation: options?.operation,
      traceId: options?.traceId,
    });
    return handlePrismaWrite(fn, logger, defaultErrorMessage, options);
  };

  return {
    prisma,
    handlePrismaNotFound,
    handleWrite,
  };
}
export {Logger} from "./logger";
export {handlePrismaNotFound} from "./handleNotFound";
export {handlePrismaWrite} from "./handlePrismaWrite";
export * from "./error";
