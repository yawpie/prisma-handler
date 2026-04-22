// import { Prisma } from "@prisma/client";
// import { BadRequestError, NotFoundError } from "../errorHandler/responseError";
import { Prisma } from "@prisma/client";
import { ErrorFactory } from "./error";


/**
 * Wraps a Prisma query and handles "not found" errors.
 * Works with `findUniqueOrThrow` or manually null-checking.
 */
export async function handlePrismaNotFound<T>(
  fn: () => Promise<T | null>,
  errorFactory: ErrorFactory,
  notFoundMessage = "Resource not found",
): Promise<T> {
  try {
    const result = await fn();
    if (!result || (Array.isArray(result) && result.length === 0)) {
      throw errorFactory(notFoundMessage, 404);
    }
    return result;
  } catch (error: any) {
    if (error?.code === "P2025") {
      throw errorFactory(notFoundMessage, 404);
    }
    throw error;
  }
}
