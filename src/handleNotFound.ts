import { randomUUID } from "crypto";
import { BadRequestError } from "./error";
import { Logger } from "./logger";

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
export async function handlePrismaNotFound<T>(
  fn: () => Promise<T | null>,
  logger?: Logger,
  options?: {
    traceId?: string;
    operation?: string;
  },
  notFoundMessage = "Resource not found",
): Promise<T> {
  const traceId = options?.traceId ?? randomUUID();
  const operation = options?.operation ?? "prisma-write";
  const start = Date.now();

  try {
    const result = await fn();
    if (!result || (Array.isArray(result) && result.length === 0)) {
      logger?.error?.(notFoundMessage, {
        traceId,
        operation,
        durationMs: Date.now() - start,
      });
      throw new BadRequestError(notFoundMessage);
    }
    return result;
  } catch (error: any) {
    if (error?.code === "P2025") {
      logger?.error?.(notFoundMessage, {
        traceId,
        operation,
        durationMs: Date.now() - start,
      });
      throw new BadRequestError(notFoundMessage);
    }
    throw error;
  }
}
