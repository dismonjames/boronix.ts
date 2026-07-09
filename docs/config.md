# Config

`kumquat.config.ts` is the only config file.

```ts
import { defineConfig } from "kumquat"

export default defineConfig({
  runtime: "bun",
  server: {
    port: 3000,
    host: "0.0.0.0"
  },
  app: {
    root: "app",
    routesDir: "app/routes",
    publicDir: "public"
  }
})
```
