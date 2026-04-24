import { handlePrismaWrite } from "../src/handlePrismaWrite";
import {HttpError} from "../src/error";
import { Logger } from "../src/logger";
import { describe, it, expect, beforeEach, jest, test } from "@jest/globals";
import { mockPrismaErrorCode } from "../utils/mockPrismaErrorCode";


// Mock logger
const mockLogger: Logger = {
  info: jest.fn(),
  error: jest.fn(),
};

// Helper: buat Prisma error dengan code tertentu

beforeEach(() => {
  jest.clearAllMocks();
});

describe("handlePrismaWrite", () => {
  // ✅ SUCCESS CASES
  describe("success", () => {
    it("mengembalikan result dari fn()", async () => {
      const result = await handlePrismaWrite(
        async () => ({ id: 1, name: "Rafi" }),
        mockLogger,
      );
      expect(result).toEqual({ id: 1, name: "Rafi" });
    });

    it("memanggil logger.info saat sukses", async () => {
      await handlePrismaWrite(async () => "ok", mockLogger);

      expect(mockLogger.info).toHaveBeenCalledTimes(1);
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Transaction committed",
        expect.objectContaining({
          operation: "prisma-write",
          durationMs: expect.any(Number),
          traceId: expect.any(String),
        }),
      );
    });

    it("menggunakan traceId dan operation dari options jika disediakan", async () => {
      await handlePrismaWrite(async () => "ok", mockLogger, undefined, {
        traceId: "trace-123",
        operation: "create-user",
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        "Transaction committed",
        expect.objectContaining({
          traceId: "trace-123",
          operation: "create-user",
        }),
      );
    });

    it("tidak memanggil logger.error saat sukses", async () => {
      await handlePrismaWrite(async () => true, mockLogger);
      expect(mockLogger.error).not.toHaveBeenCalled();
    });
  });

  // ❌ PRISMA ERROR CASES
  describe("prisma error mapping", () => {
    const cases: Array<[string, number, string]> = [
      ["P2002", 400, "Duplicate value"],
      ["P2003", 400, "Foreign key constraint failed"],
      ["P2025", 404, "Resource not found"],
      ["P2004", 400, "Invalid data"],
      ["P2005", 400, "Data too long for column"],
      ["P2006", 400, "Null constraint violation"],
    ];

    test.each(cases)(
      "error code %s → HttpError status %i dengan pesan '%s'",
      async (code, status, message) => {
        await expect(
          handlePrismaWrite(async () => {
            throw mockPrismaErrorCode(code);
          }, mockLogger),
        ).rejects.toMatchObject({
          message,
          status: status,
          stack: expect.any(String),
        });
      },
    );

    it("error code tidak dikenal → HttpError 500 dengan defaultMessage", async () => {
      await expect(
        handlePrismaWrite(
          async () => {
            throw mockPrismaErrorCode("P9999");
          },
          mockLogger,
          "Custom error message",
        ),
      ).rejects.toMatchObject({
        message: "Custom error message",
        status: 500,
        stack: expect.any(String),
      });
    });

    it("error code tidak dikenal tanpa defaultMessage → pesan fallback", async () => {
      await expect(
        handlePrismaWrite(async () => {
          throw mockPrismaErrorCode("P9999");
        }, mockLogger),
      ).rejects.toMatchObject({
        message: "Something happened :( check logs",
        status: 500,
        stack: expect.any(String),
      });
    });
  });

  // 🪵 LOGGER ON ERROR
  describe("logging saat error", () => {
    it("memanggil logger.error saat fn() gagal", async () => {
      await expect(
        handlePrismaWrite(async () => {
          throw mockPrismaErrorCode("P2002");
        }, mockLogger),
      ).rejects.toThrow(HttpError);

      expect(mockLogger.error).toHaveBeenCalledTimes(1);
      expect(mockLogger.error).toHaveBeenCalledWith(
        "Transaction failed",
        expect.objectContaining({
          traceId: expect.any(String),
          operation: "prisma-write",
          durationMs: expect.any(Number),
          error: expect.any(Error),
        }),
      );
    });

    it("tidak memanggil logger.info saat fn() gagal", async () => {
      await expect(
        handlePrismaWrite(async () => {
          throw mockPrismaErrorCode("P2002");
        }, mockLogger),
      ).rejects.toThrow();

      expect(mockLogger.info).not.toHaveBeenCalled();
    });
  });

  // 🔒 TYPE SAFETY
  describe("type safety", () => {
    it("mengembalikan tipe yang sesuai dengan generic T", async () => {
      const result: { id: number } = await handlePrismaWrite(
        async () => ({ id: 42 }),
        mockLogger,
      );
      expect(result.id).toBe(42);
    });
  });
});
