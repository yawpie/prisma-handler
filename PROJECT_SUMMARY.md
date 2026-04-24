# Project Summary: prisma-operation-handler

## Purpose

`prisma-operation-handler` is a lightweight TypeScript utility library for wrapping Prisma operations with:

- consistent HTTP-style error mapping,
- optional structured logging,
- reusable not-found handling.

It is intended for backend services that use Prisma and want cleaner, centralized operation handling.

## Tech Stack

- Language: TypeScript
- Runtime target: Node.js (target `node18` in build config)
- ORM integration: Prisma (`@prisma/client` as peer dependency)
- Build tool: `tsup` (outputs CJS + ESM + d.ts)

## Package Metadata

- Package name: `prisma-operation-handler`
- Version: `0.0.2-alpha`
- Entry exports:
  - ESM: `dist/index.js`
  - CJS: `dist/index.cjs`
  - Types: `dist/index.d.ts`

## High-Level Architecture

Main factory function:

- `createPrismaUtils(prisma, config?)` in `src/index.ts`

It returns:

- `prisma`: same PrismaClient instance passed in
- `handleWrite`: wrapper for write operations
- `handleNotFound`: wrapper for query operations that may return null/empty

Core modules:

- `src/handlePrismaWrite.ts`: maps known Prisma write errors into `HttpError`
- `src/handleNotFound.ts`: throws `NotFoundError` for null/empty or Prisma `P2025`
- `src/error.ts`: custom error classes (`HttpError`, `NotFoundError`, etc.)
- `src/logger.ts`: logger interface and default console logger implementation

## Public API

### `createPrismaUtils(prisma, config?)`

`config` supports optional custom logger:

- `logger.info(msg, meta?)`
- `logger.error(msg, meta?)`

### `handleWrite(fn, defaultErrorMessage?, options?)`

- Executes async write function `fn`
- Adds tracing metadata (`traceId`, `operation`, duration)
- Maps Prisma error codes to HTTP-friendly `HttpError`

Prisma code mapping:

- `P2002` -> 400 Duplicate value
- `P2003` -> 400 Foreign key constraint failed
- `P2025` -> 404 Resource not found
- `P2004` -> 400 Invalid data
- `P2005` -> 400 Data too long for column
- `P2006` -> 400 Null constraint violation
- default -> 500 with custom/default message

### `handleNotFound(fn, options?, notFoundMessage?)`

- Executes async query function `fn` that returns `T | null`
- Throws `NotFoundError` when:
  - result is null/falsy,
  - result is an empty array,
  - Prisma throws `P2025`
- Re-throws other errors unchanged

## Error Model

Defined in `src/error.ts`:

- `HttpError` (base class with `status`)
- `NotFoundError` (404)
- `BadRequestError` (400)
- `UnauthorizedError` (401)
- `UnexpectedError` (500)

Note:

- `BadRequestError` is imported in `src/handleNotFound.ts` but not used.

## Logging Behavior

Default logger (`LoggerClass`):

- `info` -> `console.log`
- `error` -> `console.error`

Operation wrappers include metadata:

- `traceId` (auto-generated UUID if absent)
- `operation`
- `durationMs`
- `error` (on write failures)

## Build and Development

Scripts:

- `npm run build` -> run `tsup`
- `npm run dev` -> `tsup --watch`

TypeScript config summary:

- strict mode enabled
- declaration output enabled
- `rootDir`: `src`
- `outDir`: `dist`

## Testing Status

- Test file exists at `test/tes.test.ts` but currently empty.
- No test script is defined in `package.json`.

## Current State and Observations

- Library structure is small and focused; easy to consume as helper package.
- README is aligned with implementation intent.
- There are minor cleanup opportunities:
  - remove unused import (`BadRequestError`) in `src/handleNotFound.ts`
  - optional consistency pass for comments and naming

## Suggested Usage Context

Best suited for:

- REST APIs using Prisma,
- services that need consistent exception mapping to HTTP response layers,
- codebases that want trace-aware logging around DB operations.
