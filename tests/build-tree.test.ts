import { expect, test } from "bun:test"
import { mkdirSync, writeFileSync, rmSync } from "node:fs"
import os from "node:os"
import path from "node:path"

const mainCliPath = path.resolve("packages/goros/src/cli/main.ts")

test("build command prints build tree", () => {
  const result = Bun.spawnSync({
    cmd: ["bun", mainCliPath, "build", "--root", "examples/basic"],
    stderr: "pipe",
    stdout: "pipe"
  })

  expect(result.exitCode).toBe(0)
  const stdout = new TextDecoder().decode(result.stdout)
  expect(stdout).toContain("app/routes")
  expect(stdout).toContain("root")
  expect(stdout).toContain("exercises")
  expect(stdout).toContain("page")
  expect(stdout).toContain("action")
  expect(stdout).toContain("built server-rendered app")
})

test("build command flags invalid page loader", () => {
  const tempDir = path.join(os.tmpdir(), `goros-build-fail-${Date.now()}`)
  
  try {
    mkdirSync(tempDir, { recursive: true })
    writeFileSync(path.join(tempDir, "package.json"), "{}", "utf8")
    writeFileSync(path.join(tempDir, "goros.config.ts"), 'export default { runtime: "bun" };', "utf8")
    
    // Create routes capsules
    mkdirSync(path.join(tempDir, "app/routes/home"), { recursive: true })
    // page.ts loader missing "export default"
    writeFileSync(path.join(tempDir, "app/routes/home/page.ts"), "const x = 12", "utf8")
    writeFileSync(path.join(tempDir, "app/routes/home/page.html"), "Home page", "utf8")

    const result = Bun.spawnSync({
      cmd: ["bun", mainCliPath, "build"],
      cwd: tempDir,
      stderr: "pipe",
      stdout: "pipe"
    })

    expect(result.exitCode).toBe(1)
    const stderr = new TextDecoder().decode(result.stderr)
    expect(stderr).toContain("KQ_PAGE_EXPORT_INVALID")
    
    const stdout = new TextDecoder().decode(result.stdout)
    expect(stdout).toContain("failed")
  } finally {
    rmSync(tempDir, { recursive: true, force: true })
  }
})
