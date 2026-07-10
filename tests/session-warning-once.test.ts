import { expect, test, afterAll } from "bun:test"
import { setBoronixMode } from "../packages/boronix/src/core/mode"
import { loadConfig } from "../packages/boronix/src/config/load-config"
import path from "node:path"

afterAll(() => {
  setBoronixMode("development")
})

test("dev missing secret warning is printed exactly once", async () => {
  setBoronixMode("development")

  // Reset the global warning flag so this test is isolated from other tests
  // that may have already triggered the warning in the same process
  const globalSymbol = Symbol.for("boronix-warned-session-secret")
  delete (globalThis as any)[globalSymbol]

  // Spy on console.warn
  let warningsCount = 0
  const originalWarn = console.warn
  console.warn = (msg: any) => {
    if (typeof msg === "string" && msg.includes("session.secret is missing")) {
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
