# @yawpie/prisma-handler

A lightweight TypeScript utility library for wrapping Prisma operations with consistent error handling, HTTP-style error mapping, and optional structured logging.

## Features

- ✅ **Write Operation Wrapper** (`handleWrite`) - Maps Prisma errors to HTTP-style error codes
- ✅ **Not-Found Handling** (`handleNotFound`) - Consistent handling for null/empty results
- ✅ **Trace-Aware Logging** - Optional custom logger with operation tracking and traceId support
- ✅ **Error Mapping** - Automatic conversion of Prisma error codes (P2002, P2003, P2025, etc.) to readable HTTP errors
- ✅ **TypeScript-First** - Full type safety with generic function signatures
- ✅ **Zero Dependencies** - Only requires Prisma as peer dependency

## Installation

```bash
npm install @yawpie/prisma-handler @prisma/client
```

## Quick Start

```ts
import { PrismaClient } from "@prisma/client";
import { createPrismaUtils } from "@yawpie/prisma-handler";

const prisma = new PrismaClient();
const { handleWrite, handleNotFound } = createPrismaUtils(prisma);

// Handle write operations with automatic error mapping
async function createUser(email: string, name: string) {
  return handleWrite(
    () => prisma.user.create({ data: { email, name } }),
    "Failed to create user",
    { operation: "create-user" }, // traceId is auto-generated if omitted
  );
}

// Handle read operations with not-found checking
async function getUserById(id: string) {
  return handleNotFound(
    () => prisma.user.findUnique({ where: { id } }),
    { operation: "get-user-by-id" },
    "User not found",
  );
}
```

## API Reference

### `createPrismaUtils(prisma, config?)`

Factory function that creates utility wrappers for Prisma operations.

**Parameters:**

- `prisma` (required): `PrismaClient` instance
- `config` (optional): Configuration object
  - `logger?` (optional): Custom logger implementing `{ info(msg, meta?): void; error(msg, meta?): void }`

**Returns:**

```ts
{
  prisma: PrismaClient;           // Same instance passed in
  handleWrite: <T>(...) => Promise<T>;
  handleNotFound: <T>(...) => Promise<T>;
}
```

### `handleWrite(fn, defaultErrorMessage?, options?)`

Wraps a Prisma write operation (create, update, delete) with error handling and logging.

**Parameters:**

- `fn` (required): Async function executing the Prisma write operation
- `defaultErrorMessage` (optional): Fallback error message for unknown errors
- `options` (optional):
  - `traceId?`: string (auto-generated if omitted)
  - `operation?`: string (operation name for logging)

**Error Mapping:**
| Prisma Code | HTTP Status | Meaning |
|-------------|------------|---------|
| P2002 | 400 | Unique constraint violation |
| P2003 | 400 | Foreign key constraint failed |
| P2004 | 400 | Invalid data |
| P2005 | 400 | Value too long for column |
| P2006 | 400 | Null constraint violation |
| P2025 | 404 | Resource not found |
| (other) | 500 | Unexpected error |

**Example:**

```ts
try {
  const user = await handleWrite(
    () =>
      prisma.user.update({
        where: { id: "123" },
        data: { name: "New Name" },
      }),
    "Failed to update user",
    { operation: "update-user", traceId: "req-456" },
  );
} catch (error) {
  // error.status contains HTTP status code
  console.error(`Error: ${error.message} (${error.status})`);
}
```

### `handleNotFound(fn, options?, notFoundMessage?)`

Wraps a Prisma query operation with not-found detection and logging.

**Parameters:**

- `fn` (required): Async function executing the Prisma query
- `options` (optional):
  - `traceId?`: string (auto-generated if omitted)
  - `operation?`: string (operation name for logging)
- `notFoundMessage` (optional): Custom message for not-found errors (default: "Resource not found")

**Throws:**

- `NotFoundError` (404) when:
  - Query returns `null` or `undefined`
  - Query returns an empty array
  - Prisma throws error code `P2025`
- Other errors are re-thrown unchanged

**Example:**

```ts
try {
  const user = await handleNotFound(
    () => prisma.user.findUnique({ where: { id: "123" } }),
    { operation: "get-user" },
    "User with ID 123 not found",
  );
} catch (error) {
  if (error.status === 404) {
    console.log("Not found:", error.message);
  }
}
```

## Custom Logger

Pass a custom logger to capture operation details:

```ts
const logger = {
  info: (msg, meta) => console.log(`[INFO] ${msg}`, meta),
  error: (msg, meta) => console.error(`[ERROR] ${msg}`, meta),
};

const { handleWrite, handleNotFound } = createPrismaUtils(prisma, { logger });
```

Logger receives metadata including:

- `operation`: Operation name from options
- `traceId`: Trace ID for request tracking
- `durationMs`: Operation duration in milliseconds

## Error Classes

The library exports custom error classes:

```ts
import {
  HttpError, // Base error with status code
  NotFoundError, // 404 errors
  BadRequestError, // 400 errors
  UnauthorizedError, // 401 errors
  UnexpectedError, // 500 errors
} from "@yawpie/prisma-handler";
```

## Tech Stack

- **Language:** TypeScript 6.0+
- **Runtime:** Node.js 18+
- **ORM:** Prisma 5.0+
- **Build:** tsup (CommonJS + ESM + TypeScript definitions)

## Development

```bash
npm run build         # Build production bundle
npm run dev           # Watch mode for development
npm run test          # Run tests once
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

## License

ISC

## Author

yawpie
