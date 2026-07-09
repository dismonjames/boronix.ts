import { expect, test } from "bun:test"
import path from "node:path"

const mainCliPath = path.resolve("packages/kumquat/src/cli/main.ts")

test("routes command prints tree by default", () => {
  const result = Bun.spawnSync({
    cmd: ["bun", mainCliPath, "routes", "--root", "examples/basic"],
    stderr: "pipe",
    stdout: "pipe"
  })

  expect(result.exitCode).toBe(0)
  const stdout = new TextDecoder().decode(result.stdout)
  expect(stdout).toContain("app/routes")
  expect(stdout).toContain("root")
  expect(stdout).toContain("exercises")
  expect(stdout).toContain("GET")
  expect(stdout).toContain("POST")
  expect(stdout).toContain("found 7 routes")
})

test("routes --json outputs valid JSON", () => {
  const result = Bun.spawnSync({
    cmd: ["bun", mainCliPath, "routes", "--root", "examples/basic", "--json"],
    stderr: "pipe",
    stdout: "pipe"
  })

  expect(result.exitCode).toBe(0)
  const stdout = new TextDecoder().decode(result.stdout)
  const parsed = JSON.parse(stdout)
  expect(Array.isArray(parsed)).toBe(true)
  expect(parsed.length).toBe(7)
  expect(parsed[0].method).toBeDefined()
  expect(parsed[0].path).toBeDefined()
})

test("routes --flat outputs flat list", () => {
  const result = Bun.spawnSync({
    cmd: ["bun", mainCliPath, "routes", "--root", "examples/basic", "--flat"],
    stderr: "pipe",
    stdout: "pipe"
  })

  expect(result.exitCode).toBe(0)
  const stdout = new TextDecoder().decode(result.stdout)
  expect(stdout).not.toContain("├─")
  expect(stdout).toContain("GET")
})
