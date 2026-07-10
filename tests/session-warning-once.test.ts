import { expect, test, afterAll } from "bun:test"
import { setBoronixMode } from "../packages/boronix/src/core/mode"
import { loadConfig } from "../packages/boronix/src/config/load-config"
import path from "node:path"

afterAll(() => {
  setBoronixMode("development")
})

test("dev missing secret warning is printed exactly once", async () => {
  setBoronixMode("development")

  // Spy on console.warn
  let warningsCount = 0
  const originalWarn = console.warn
  console.warn = (msg) => {
    if (msg && msg.includes("session.secret is missing")) {
      warningsCount++
    }
  }

  const dummyRoot = path.join(__dirname, "../examples/basic")

  // Load config multiple times
  await loadConfig(dummyRoot)
  await loadConfig(dummyRoot)
  await loadConfig(dummyRoot)

  // Restore console.warn
  console.warn = originalWarn

  expect(warningsCount).toBe(1)
})
