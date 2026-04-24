import { describe, expect, it, jest } from "@jest/globals";
import { handlePrismaNotFound } from "../src/handlePrismaNotFound";
import { Logger } from "../src/logger";
import { mockPrismaErrorCode } from "../utils/mockPrismaErrorCode";

const mockLogger: Logger = {
  info: jest.fn(),
  error: jest.fn(),
};

describe("handleNotFound", () => {
  it("should return the result if found", async () => {
    const result = await handlePrismaNotFound(
      async () => ({ id: 1, name: "Rafi" }),
      mockLogger,
    );
    expect(result).toEqual({ id: 1, name: "Rafi" });
  });

  it("should throw an error if not found", async () => {
    await expect(
      handlePrismaNotFound(async () => null, mockLogger),
    ).rejects.toThrow("Resource not found");
  });

  it("should throw an error when status code P2025", async () => {
    await expect(
      handlePrismaNotFound(
        async () => {
          throw mockPrismaErrorCode("P2025");
        },
        mockLogger,
      ),
    ).rejects.toMatchObject({
      message: "Resource not found",
      status: 404,
      stack: expect.any(String),
    });
  });

  const notFoundMessage = "not found cuy";
  it("should use notFoundMessage when given in parameter", async () => {
    await expect(
      handlePrismaNotFound(
        async () => null,
        mockLogger,
        undefined,
        notFoundMessage,
      ),
    ).rejects.toMatchObject({
      message: notFoundMessage,
      status: 404,
      stack: expect.any(String),
    });
  });
  
});
