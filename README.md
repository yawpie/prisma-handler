# prisma-operation-handler

A lightweight utility package for handling Prisma operations with consistent error mapping and structured logging.

This repository provides a factory, `createPrismaUtils`, that helps you:

- Wrap write operations with a standard error strategy.
- Handle not-found results in a consistent way.
- Add trace-aware logging metadata to Prisma write flows.

## Features

- Prisma write wrapper with HTTP-style error mapping.
- Not-found wrapper for nullable query results.
- Optional custom logger injection.
- TypeScript-friendly API.

## Installation

Install the package and Prisma client:

```bash
npm install prisma-operation-handler @prisma/client
```

If your app does not already include Prisma CLI for schema/migrations, also install:

```bash
npm install -D prisma
```

## Quick Start

```ts
import { PrismaClient } from "@prisma/client";
import { createPrismaUtils } from "prisma-operation-handler";

const prisma = new PrismaClient();

const { handleWrite, handleNotFound } = createPrismaUtils(prisma);

async function createUser() {
  return handleWrite(
    () =>
      prisma.user.create({
        data: {
          email: "hello@example.com",
          name: "Hello",
        },
      }),
    "Failed to create user",
    {
      operation: "create-user",
      // traceId is optional. If omitted, one is generated.
    },
  );
}

async function getUserById(id: string) {
  return handleNotFound(
    () => prisma.user.findUnique({ where: { id } }),
    { operation: "get-user-by-id" },
    "User not found",
  );
}
```

## API

### `createPrismaUtils(prisma, config?)`

Creates and returns Prisma utility helpers.

Parameters:

- `prisma`: `PrismaClient`
- `config` (optional):
  - `logger` (optional): object implementing:
    - `info(msg: string, meta?: any): void`
    - `error(msg: string, meta?: any): void`

Returns:

- prisma: the same Prisma client you passed in.
- handleWrite: write-operation wrapper.
- handleNotFound: not-found wrapper.

### `handleWrite(fn, defaultErrorMessage?, options?)`

Wraps a Prisma write operation and maps known Prisma errors to `HttpError`.

Parameters:

- `fn`: async function that performs the write operation.
- `defaultErrorMessage` (optional): fallback message for unknown errors.
- `options` (optional):
  - `traceId?: string`
  - `operation?: string`

Behavior:

- On success, returns `await fn()` result.
- On known Prisma errors, throws `HttpError` with mapped status/message.
- On unknown errors, throws `HttpError(defaultErrorMessage ?? "Something happened :( check logs", 500)`.

### `handleNotFound(fn, notFoundMessage?)`

Wraps a query operation and throws when result is missing.

Parameters:

- `fn`: `async function returning T | null`.
- options (optional):
  - `traceId?: string`
  - `operation?: string`
- `notFoundMessage (optional)`: defaults to "Resource not found".

Behavior:

- Throws `NotFoundError(notFoundMessage)` when:
  - returned result is null/falsy
  - returned result is an empty array
  - Prisma throws P2025

## Prisma Error Mapping (Write Wrapper)

`handleWrite` maps Prisma codes as follows:

| Prisma code | Message                         | Status |
| ----------- | ------------------------------- | ------ |
| P2002       | Duplicate value                 | 400    |
| P2003       | Foreign key constraint failed   | 400    |
| P2025       | Resource not found              | 404    |
| P2004       | Invalid data                    | 400    |
| P2005       | Data too long for column        | 400    |
| P2006       | Null constraint violation       | 400    |
| default     | defaultErrorMessage or fallback | 500    |

## Logging

The write wrapper logs transaction outcomes with metadata:

- `traceId`
- `operation`
- `durationMs`
- `error` (on failure)

Default logger prints to console:

- `info` via `console.log`
- `error` via `console.error`

You can inject your own logger implementation through `createPrismaUtils(prisma, { logger })`.

## Development

### Scripts

- `npm run build` compiles and bundles the package to `dist`.
- `npm run dev` starts `tsup` in watch mode.

### TypeScript Build Output

The package is built with tsup and outputs:

- CJS and ESM formats
- Type declarations (.d.ts)
- sourcemaps

## Current Notes

- The package currently exports the Prisma utility factory and wrappers through the main entry.
- Some custom error subclasses exist in source and are used internally for behavior.
- The not-found helper currently throws `NotFoundError` for not-found conditions.

## License

ISC
