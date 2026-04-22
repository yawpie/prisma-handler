import { PrismaClient } from "@prisma/client";
import { Logger, LoggerClass } from "./logger";
import { handlePrismaWrite } from "./handlePrismaWrite";
import { handlePrismaNotFound } from "./handleNotFound";
import { ErrorFactory } from "./error";


export function createPrismaUtils(
  prisma: PrismaClient,
  config?: {
    errorFactory: ErrorFactory;
    logger?: Logger;
  },
) {
  
  let logger: Logger = new LoggerClass();
  if (config) {
      errorFactory = config.errorFactory;
      logger = config.logger || logger;
  }

  // async function handleNotFound<T>(
  //   fn: (prisma: PrismaClient) => Promise<T | null>,
  //   message = "Resource not found",
  // ): Promise<T> {
  //   try {
  //     const result = await fn(prisma);

  //     if (!result || (Array.isArray(result) && result.length === 0)) {
  //       throw errorFactory(message);
  //     }

  //     return result;
  //   } catch (error: any) {
  //     if (error.code === "P2025") {
  //       throw errorFactory(message);
  //     }
  //     throw error;
  //   }
  // }

  // async function handleWrite<T>(
  //   fn: (prisma: PrismaClient) => Promise<T>,
  //   options?: {
  //     traceId?: string;
  //     operation?: string;
  //     defaultMessage?: string;
  //   },
  // ): Promise<T> {
  //   const traceId = options?.traceId ?? randomUUID();
  //   const operation = options?.operation ?? "prisma-write";
  //   const start = Date.now();

  //   logger?.info?.("Transaction started", { traceId, operation });

  //   try {
  //     const result = await fn(prisma);

  //     logger?.info?.("Transaction committed", {
  //       traceId,
  //       operation,
  //       durationMs: Date.now() - start,
  //     });

  //     return result;
  //   } catch (error: any) {
  //     logger?.error?.("Transaction failed", {
  //       traceId,
  //       operation,
  //       durationMs: Date.now() - start,
  //       error,
  //     });

  //     if (error.code === "P2002") {
  //       throw errorFactory("Duplicate value", 400);
  //     }

  //     if (error.code === "P2003") {
  //       throw errorFactory("Foreign key constraint failed", 400);
  //     }

  //     throw errorFactory(options?.defaultMessage ?? "Database error", 500);
  //   }
  // }
  return {
    prisma,
    handlePrismaNotFound,
    handlePrismaWrite,
  };
}
