// import { Prisma } from "@prisma/client";
// import { BadRequestError, NotFoundError } from "../errorHandler/responseError";
// import { Prisma } from "@prisma/client";
import { BadRequestError } from "./error";

/**
 * Wraps a Prisma query and handles "not found" errors.
 * Works with `findUniqueOrThrow` or manually null-checking.
 * @param fn function to execute
 * @param notFoundMessage message to display when resource is not found
 * @returns the result of the function or throws a BadRequestError
 * @throws BadRequestError if the resource is not found
 */
export async function handlePrismaNotFound<T>(
  fn: () => Promise<T | null>,
  notFoundMessage = "Resource not found",
): Promise<T> {
  try {
    const result = await fn();
    if (!result || (Array.isArray(result) && result.length === 0)) {
      throw new BadRequestError(notFoundMessage);
    }
    return result;
  } catch (error: any) {
    if (error?.code === "P2025") {
      throw new BadRequestError(notFoundMessage);
    }
    throw error;
  }
}
