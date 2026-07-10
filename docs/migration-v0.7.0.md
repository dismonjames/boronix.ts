# Migrating to v0.7.0

v0.7.0 introduces the **Node-first Runtime** model for Boronix.

## Key Changes

1. **Default Runtime**: Node.js is now the default runtime. Bun is optional.
2. **Package Manager**: npm is canonical.
3. **Database Driver**: SQLite templates migrate from `bun:sqlite` to `@libsql/client` (LibSQL).

## How to Migrate

### 1. Update package.json
Bump your dependencies to:
```json
{
  "dependencies": {
    "boronix": "^0.7.0"
  },
  "engines": {
    "node": ">=18.18"
  }
}
```

### 2. Migrate SQLite
If you are using SQLite, replace `app/db/client.ts` with:
```ts
import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"
import * as schema from "./schema"

const url = process.env.DATABASE_URL ?? "file:local.db"
const client = createClient({ url })

export const db = drizzle(client, { schema })
```
Update your `drizzle.config.ts` dialect to `"sqlite"` and specify the URL appropriately.
