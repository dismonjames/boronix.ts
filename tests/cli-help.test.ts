import { expect, test } from "bun:test"
import path from "node:path"

const mainCliPath = path.resolve("packages/goros/src/cli/main.ts")

test("root help has commands", () => {
  const result = Bun.spawnSync({
    cmd: ["bun", mainCliPath, "--help"],
    stderr: "pipe",
    stdout: "pipe"
  })

  expect(result.exitCode).toBe(0)
  const stdout = new TextDecoder().decode(result.stdout)
  expect(stdout).toContain("dev")
  expect(stdout).toContain("build")
  expect(stdout).toContain("start")
  expect(stdout).toContain("info")
  expect(stdout).toContain("doctor")
  expect(stdout).toContain("typegen")
})

test("dev help has optional flags", () => {
  const result = Bun.spawnSync({
    cmd: ["bun", mainCliPath, "dev", "--help"],
    stderr: "pipe",
    stdout: "pipe"
  })

  expect(result.exitCode).toBe(0)
  const stdout = new TextDecoder().decode(result.stdout)
  expect(stdout).toContain("--runtime")
  expect(stdout).toContain("--port")
  expect(stdout).toContain("--host")
})
