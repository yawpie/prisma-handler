export function mockPrismaErrorCode(code: string): Error & { code: string } {
  const err = new Error(`Prisma error ${code}`) as Error & { code: string };
  err.code = code;
  return err;
}
