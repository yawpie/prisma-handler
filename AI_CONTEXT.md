# AI Context: @yawpie/prisma-handler

## TL;DR

Small TypeScript utility package to standardize Prisma operation handling:

- `handleWrite`: wraps write ops, maps Prisma errors to HTTP-style errors, logs metadata.
- `handleNotFound`: wraps read ops, throws not-found for null/empty/P2025, and rethrows unknown errors.
- `createPrismaUtils`: factory that bundles Prisma client + wrappers + optional logger injection.

## Project Type

- Library/package (not an application)
- Runtime target: Node.js
- ORM dependency model: Prisma client as peer dependency (`@prisma/client >=5`)

## Package Metadata

- Name: `@yawpie/prisma-handler`
- Version: `0.0.3-alpha`
- License: `ISC`
- Author: `yawpie`

## Key Public API

- `createPrismaUtils(prisma, config?)`
- Returned helpers:
  - `handleWrite(fn, defaultErrorMessage?, options?)`
  - `handleNotFound(fn, options?, notFoundMessage?)`

## Important Files

- `src/index.ts`: public factory and exports
- `src/handlePrismaWrite.ts`: write wrapper + Prisma code mapping
- `src/handlePrismaNotFound.ts`: not-found wrapper behavior
- `src/error.ts`: `HttpError` and subclasses
- `src/logger.ts`: logger interface + default console logger
- `README.md`: usage docs and examples
- `package.json`: packaging/export metadata

## Behavior Notes

- `handleWrite` maps Prisma codes:
  - P2002 -> 400 Duplicate value
  - P2003 -> 400 Foreign key constraint failed
  - P2025 -> 404 Resource not found
  - P2004 -> 400 Invalid data
  - P2005 -> 400 Data too long for column
  - P2006 -> 400 Null constraint violation
  - default -> 500 with fallback/custom message
- `handleNotFound` throws `NotFoundError` when result is null/falsy, empty array, or Prisma throws P2025.
- Trace metadata supports `traceId`, `operation`, and duration logging.

## Build/Tooling

- Build command: `npm run build` (tsup)
- Dev watch: `npm run dev`
- Test command: `npm run test` (jest + ts-jest)
- Coverage command: `npm run test:coverage`
- Watch test command: `npm run test:watch`
- Output formats: CJS + ESM + d.ts

## Test Files

- `test/handleWrite.test.ts`
- `test/handleNotFound.test.ts`

## Caveats for Other AI Models

- Package uses `"type": "module"` while `tsconfig` module is `CommonJS`; final outputs are still handled by tsup (CJS+ESM), so prefer checking built exports rather than tsconfig alone.

## Install Snippet

```bash
npm install @yawpie/prisma-handler @prisma/client
```

## Suggested Prompt Seed

"This is a TypeScript Prisma utility library. Focus changes on wrappers in `src/handlePrismaWrite.ts` and `src/handlePrismaNotFound.ts`, preserve public API in `src/index.ts`, and keep error mapping behavior backward compatible unless explicitly requested."
