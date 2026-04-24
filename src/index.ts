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

  /**
   * Wraps a Prisma query and handles "not found" errors.
   * Works with `findUniqueOrThrow` or manually null-checking.
   * @param fn function to execute
   * @param logger optional logger for error logging
   * @param options additional options like traceId and operation name for logging
   * @param notFoundMessage message to display when resource is not found
   * @returns the result of the function or throws a BadRequestError
   * @throws BadRequestError if the resource is not found
   */
  const handleNotFound = <T>(
    fn: () => Promise<T | null>,
    options?: {
      traceId?: string;
      operation?: string;
    },
    notFoundMessage = "Resource not found",
  ) => {
    logger.info("Prisma read operation started", {
      operation: options?.operation,
      traceId: options?.traceId,
    });
    return handlePrismaNotFound(fn, logger, options, notFoundMessage);
  };

  return {
    prisma,
    handleNotFound,
    handleWrite,
  };
}
export { Logger } from "./logger";
export * from "./error";
