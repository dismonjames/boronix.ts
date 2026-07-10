import { defineConfig } from "vitest/config"
import path from "node:path"

export default defineConfig({
  test: {
    alias: {
      "bun:test": path.resolve(__dirname, "./tests/bun-test-compat.ts"),
      "boronix": path.resolve(__dirname, "./packages/boronix/src/index.ts")
    },
    include: ["tests/**/*.test.ts"],
    testTimeout: 20000
  }
})
