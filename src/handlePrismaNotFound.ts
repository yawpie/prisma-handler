import { randomUUID } from "crypto";
import { NotFoundError } from "./error";
import { Logger } from "./logger";

export async function handlePrismaNotFound<T>(
  fn: () => Promise<T>,
  logger?: Logger,
  options?: {
    traceId?: string;
    operation?: string;
  },
  notFoundMessage = "Resource not found",
): Promise<T> {
  const traceId = options?.traceId ?? randomUUID();
  const operation = options?.operation ?? "prisma-read";
  const start = Date.now();

  try {
    const result = await fn();
    if (!result || (Array.isArray(result) && result.length === 0)) {
      logger?.error?.(notFoundMessage, {
        traceId,
        operation,
        durationMs: Date.now() - start,
      });
      throw new NotFoundError(notFoundMessage);
    }
    return result;
  } catch (error: any) {
    if (error?.code === "P2025") {
      logger?.error?.(notFoundMessage, {
        traceId,
        operation,
        durationMs: Date.now() - start,
      });
      throw new NotFoundError(notFoundMessage);
    }
    throw error;
  }
}
