import { expect, test } from "bun:test"
import path from "node:path"

const mainCliPath = path.resolve("packages/goros/src/cli/main.ts")

test("inspect matches static route", () => {
  const result = Bun.spawnSync({
    cmd: ["bun", mainCliPath, "inspect", "/login", "--root", "examples/basic"],
    stderr: "pipe",
    stdout: "pipe"
  })

  expect(result.exitCode).toBe(0)
  const stdout = new TextDecoder().decode(result.stdout)
  expect(stdout).toContain("matched")
  expect(stdout).toContain("/login")
  expect(stdout).toContain("files")
  expect(stdout).toContain("page.html")
  expect(stdout).toContain("route resolved")
})

test("inspect matches dynamic route and displays params", () => {
  const result = Bun.spawnSync({
    cmd: ["bun", mainCliPath, "inspect", "/exercises/123", "--root", "examples/basic"],
    stderr: "pipe",
    stdout: "pipe"
  })

  expect(result.exitCode).toBe(0)
  const stdout = new TextDecoder().decode(result.stdout)
  expect(stdout).toContain("matched")
  expect(stdout).toContain("/exercises/:id")
  expect(stdout).toContain("params")
  expect(stdout).toContain("id")
  expect(stdout).toContain("123")
  expect(stdout).toContain("route resolved")
})

test("inspect non-matching route throws error", () => {
  const result = Bun.spawnSync({
    cmd: ["bun", mainCliPath, "inspect", "/missing", "--root", "examples/basic"],
    stderr: "pipe",
    stdout: "pipe"
  })

  expect(result.exitCode).toBe(1)
  const stderr = new TextDecoder().decode(result.stderr)
  expect(stderr).toContain("KQ_ROUTE_NOT_FOUND")
})
