import { expect, test } from "bun:test"
import path from "node:path"

const mainCliPath = path.resolve("packages/boronix/src/cli/main.ts")

test("doctor outputs checklist with tree branch rails", () => {
  const result = Bun.spawnSync({
    cmd: ["bun", mainCliPath, "doctor", "--root", "examples/basic"],
    cwd: path.resolve("."),
    env: { ...process.env, TERM: "xterm-256color" },
    stderr: "pipe",
    stdout: "pipe"
  })

  expect(result.exitCode).toBe(0)
  const stderr = new TextDecoder().decode(result.stderr)
  expect(stderr).not.toContain("error")  // No errors in stderr
  const stdout = new TextDecoder().decode(result.stdout)
  if (result.exitCode !== 0) {
    console.log("DOCTOR STDOUT:", stdout)
    console.log("DOCTOR STDERR:", stderr)
  }
  expect(stdout).toContain("project")
  expect(stdout).toContain("├─")
  expect(stdout).toContain("package.json found")
  expect(stdout).toContain("boronix.config.ts found")
  expect(stdout).toContain("runtime")
  expect(stdout).toContain("project looks healthy")
})
