import { expect, test } from "bun:test"
import path from "node:path"

test("release-check script passes successfully", () => {
  const result = Bun.spawnSync({
    cmd: ["bun", "scripts/release-check.ts"],
    env: { ...process.env, KUMQUAT_SKIP_TESTS: "1" },
    stderr: "pipe",
    stdout: "pipe"
  })

  expect(result.exitCode).toBe(0)
  const stdout = new TextDecoder().decode(result.stdout)
  expect(stdout).toContain("Release check")
  expect(stdout).toContain("tests passed")
  expect(stdout).toContain("typecheck passed")
  expect(stdout).toContain("build passed")
  expect(stdout).toContain("package metadata valid")
})
