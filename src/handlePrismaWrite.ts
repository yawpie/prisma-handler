import { Prisma } from "@prisma/client";
import HttpError from "./error";
import { Logger, LoggerClass } from "./logger";
import { randomUUID } from "crypto";

// export async function handlePrismaWrite<T>(
//   fn: () => Promise<T>,
//   errorFactory: ErrorFactory,
//   defaultMessage?: string,
//   options?: {
//     traceId?: string;
//     operation?: string;
//   }
// ): Promise<T> {
//   const traceId = options?.traceId ?? randomUUID();
//   const operation = options?.operation ?? "prisma-write";
//   const start = Date.now();

//   const logger: Logger = new LoggerClass();
//   logger.info("Transaction started", { traceId, operation });

//   try {
//     const result = await fn();

//     logger.info("Transaction committed", {
//       traceId,
//       operation,
//       durationMs: Date.now() - start,
//     });

//     return result;
//   } catch (error: any) {
//       logger?.error?.("Transaction failed", {
//         traceId,
//         operation,
//         durationMs: Date.now() - start,
//         error,
//       });

//       if (error.code === "P2002") {
//         throw errorFactory("Duplicate value", 400);
//       }

//       if (error.code === "P2003") {
//         throw errorFactory("Foreign key constraint failed", 400);
//       }

//       throw errorFactory(defaultMessage ?? "Database error", 500);
//     }
// }

export async function handlePrismaWrite<T>(
  fn: () => Promise<T>,
  logger: Logger,
  defaultMessage?: string,
  options?: {
    traceId?: string;
    operation?: string;
  },
): Promise<T> {
  const traceId = options?.traceId ?? randomUUID();
  const operation = options?.operation ?? "prisma-write";
  const start = Date.now();
  //   logger.info("Transaction started", { traceId, operation });
  logger.info("Transaction started", { traceId, operation });

  try {
    const result = await fn();

    logger.info("Transaction committed", {
      traceId,
      operation,
      durationMs: Date.now() - start,
    });

    return result;
  } catch (error: any) {
    logger.error("Transaction failed", {
      traceId,
      operation,
      durationMs: Date.now() - start,
      error,
    });

    switch (error.code) {
      case "P2002":
        throw new HttpError("Duplicate value", 400);
      case "P2003":
        throw new HttpError("Foreign key constraint failed", 400);
      case "P2025":
        throw new HttpError("Resource not found", 404);
      case "P2004":
        throw new HttpError("Invalid data", 400);
      case "P2005":
        throw new HttpError("Data too long for column", 400);
      case "P2006":
        throw new HttpError("Null constraint violation", 400);
      default: {
        throw new HttpError(defaultMessage ?? "Something happened :( check logs", 500);
      }
    }

    throw error;
  }
}
