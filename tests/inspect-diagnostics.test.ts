import { expect, test } from "bun:test"
import path from "node:path"

const mainCliPath = path.resolve("packages/boronix/src/cli/main.ts")

test("inspect supports json mode", () => {
  const result = Bun.spawnSync({
    cmd: ["bun", mainCliPath, "inspect", "/login", "--root", "examples/basic", "--json"],
    stderr: "pipe",
    stdout: "pipe"
  })

  expect(result.exitCode).toBe(0)
  const stdout = new TextDecoder().decode(result.stdout)
  const parsed = JSON.parse(stdout)
  expect(parsed.success).toBe(true)
  expect(parsed.request.kind).toBe("page")
})

test("inspect supports method and action parsing", () => {
  const result = Bun.spawnSync({
    cmd: ["bun", mainCliPath, "inspect", "/login?/login", "--root", "examples/basic"],
    stderr: "pipe",
    stdout: "pipe"
  })

  expect(result.exitCode).toBe(0)
  const stdout = new TextDecoder().decode(result.stdout)
  expect(stdout).toContain("kind    action")
  expect(stdout).toContain("action")
  expect(stdout).toContain("login")
})

test("inspect fails with KQ_ACTION_NOT_FOUND on missing action", () => {
  const result = Bun.spawnSync({
    cmd: ["bun", mainCliPath, "inspect", "/login?/nonexistent", "--root", "examples/basic"],
    stderr: "pipe",
    stdout: "pipe"
  })

  expect(result.exitCode).toBe(1)
  const stderr = new TextDecoder().decode(result.stderr)
  expect(stderr).toContain("KQ_ACTION_NOT_FOUND")
})
