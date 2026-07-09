import { expect, test } from "bun:test"
import path from "node:path"

const mainCliPath = path.resolve("packages/kumquat/src/cli/main.ts")

test("doctor outputs checklist with tree branch rails", () => {
  const result = Bun.spawnSync({
    cmd: ["bun", mainCliPath, "doctor", "--root", "examples/basic"],
    env: { ...process.env, TERM: "xterm-256color" },
    stderr: "pipe",
    stdout: "pipe"
  })

  expect(result.exitCode).toBe(0)
  const stdout = new TextDecoder().decode(result.stdout)
  expect(stdout).toContain("project")
  expect(stdout).toContain("├─")
  expect(stdout).toContain("package.json found")
  expect(stdout).toContain("kumquat.config.ts found")
  expect(stdout).toContain("runtime")
  expect(stdout).toContain("project looks healthy")
})
