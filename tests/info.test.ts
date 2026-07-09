import { expect, test } from "bun:test"
import path from "node:path"

const mainCliPath = path.resolve("packages/boronix/src/cli/main.ts")

test("info command includes environment details", () => {
  const result = Bun.spawnSync({
    cmd: ["bun", mainCliPath, "info"],
    stderr: "pipe",
    stdout: "pipe"
  })

  expect(result.exitCode).toBe(0)
  const stdout = new TextDecoder().decode(result.stdout)
  expect(stdout).toContain("system")
  expect(stdout).toContain("binaries")
  expect(stdout).toContain("boronix")
  expect(stdout).toContain("project")
  expect(stdout).toContain("bun")
  expect(stdout).toContain("node")
})
