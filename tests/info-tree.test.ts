import { expect, test } from "bun:test"
import path from "node:path"

const mainCliPath = path.resolve("packages/boronix/src/cli/main.ts")

test("info outputs metadata with tree branches", () => {
  const result = Bun.spawnSync({
    cmd: ["bun", mainCliPath, "info", "--root", "examples/basic"],
    env: { ...process.env, TERM: "xterm-256color" },
    stderr: "pipe",
    stdout: "pipe"
  })

  expect(result.exitCode).toBe(0)
  const stdout = new TextDecoder().decode(result.stdout)
  expect(stdout).toContain("system")
  expect(stdout).toContain("├─")
  expect(stdout).toContain("os")
  expect(stdout).toContain("cpu")
  expect(stdout).toContain("binaries")
  expect(stdout).toContain("project")
  expect(stdout).toContain("pages")
})
