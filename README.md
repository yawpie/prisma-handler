# @yawpie/prisma-handler

A small TypeScript helper for Prisma projects that standardizes read/write error handling, adds optional structured logging, and converts common Prisma errors into HTTP-style errors.

## What It Provides

- `createPrismaUtils(prisma, config?)` for creating Prisma operation wrappers
- `handleWrite` for write operations with Prisma error mapping
- `handleNotFound` for query operations that may return `null`, `undefined`, an empty array, or `P2025`
- Custom error classes for app-level handling
- Optional logger support with `traceId`, `operation`, and `durationMs` metadata

## Installation

```bash
npm install @yawpie/prisma-handler @prisma/client
```

`@prisma/client` is required as a peer dependency.

## Usage

```ts
import { PrismaClient } from "@prisma/client";
import { createPrismaUtils } from "@yawpie/prisma-handler";

const prisma = new PrismaClient();
const { handleWrite, handleNotFound } = createPrismaUtils(prisma);

async function createUser(email: string, name: string) {
  return handleWrite(
    () => prisma.user.create({ data: { email, name } }),
    "Failed to create user",
    { operation: "create-user" },
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

Creates a small wrapper around a `PrismaClient` instance.

Returns:

```ts
{
  prisma: PrismaClient;
  handleWrite: <T>(...) => Promise<T>;
  handleNotFound: <T>(...) => Promise<T>;
}
```

`config.logger` can be any object with `info(msg, meta?)` and `error(msg, meta?)` methods.

### `handleWrite(fn, defaultErrorMessage?, options?)`

Wraps a Prisma write operation and translates Prisma error codes into HTTP-style errors.

| Prisma Code | Status | Message                                                     |
| ----------- | ------ | ----------------------------------------------------------- |
| `P2002`     | `400`  | `Duplicate value`                                           |
| `P2003`     | `400`  | `Foreign key constraint failed`                             |
| `P2004`     | `400`  | `Invalid data`                                              |
| `P2005`     | `400`  | `Data too long for column`                                  |
| `P2006`     | `400`  | `Null constraint violation`                                 |
| `P2025`     | `404`  | `Resource not found`                                        |
| other       | `500`  | `defaultErrorMessage` or `Something happened :( check logs` |

### `handleNotFound(fn, options?, notFoundMessage?)`

Wraps a Prisma query operation and throws `NotFoundError` when the result is empty or Prisma reports `P2025`.

The default message is `Resource not found`.

## Logger Output

If you pass a custom logger, the library emits messages such as `Prisma write operation started`, `Transaction committed`, `Transaction failed`, and `Prisma read operation started`.

The metadata includes:

- `operation`
- `traceId`
- `durationMs`
- `error` for failed write operations

## Exports

The package entrypoint exports:

```ts
import {
  createPrismaUtils,
  Logger,
  HttpError,
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
  UnexpectedError,
} from "@yawpie/prisma-handler";
```

## Requirements

- Node.js 18+
- TypeScript 6.x for development
- Prisma 5.x or newer via `@prisma/client`

## Development

```bash
npm run build
npm run dev
npm run test
npm run test:watch
npm run test:coverage
```

## License

MIT
