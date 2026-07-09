import { expect, test } from "bun:test"
import { mkdirSync, writeFileSync, rmSync } from "node:fs"
import os from "node:os"
import path from "node:path"

const mainCliPath = path.resolve("packages/goros/src/cli/main.ts")

test("healthy app doctor exits 0", () => {
  const tempDir = path.join(os.tmpdir(), `goros-doctor-ok-${Date.now()}`)
  
  try {
    mkdirSync(tempDir, { recursive: true })
    writeFileSync(path.join(tempDir, "package.json"), "{}", "utf8")
    writeFileSync(path.join(tempDir, "goros.config.ts"), 'export default { runtime: "bun" };', "utf8")
    mkdirSync(path.join(tempDir, "app/routes/home"), { recursive: true })
    writeFileSync(path.join(tempDir, "app/routes/home/page.html"), "<h1>Home</h1>", "utf8")
    mkdirSync(path.join(tempDir, "public"), { recursive: true })

    const result = Bun.spawnSync({
      cmd: ["bun", mainCliPath, "doctor"],
      cwd: tempDir,
      stderr: "pipe",
      stdout: "pipe"
    })

    expect(result.exitCode).toBe(0)
    const stdout = new TextDecoder().decode(result.stdout)
    expect(stdout).toContain("project looks healthy")
  } finally {
    rmSync(tempDir, { recursive: true, force: true })
  }
})

test("missing routes doctor exits 1", () => {
  const tempDir = path.join(os.tmpdir(), `goros-doctor-fail-${Date.now()}`)

  try {
    mkdirSync(tempDir, { recursive: true })
    writeFileSync(path.join(tempDir, "package.json"), "{}", "utf8")
    writeFileSync(path.join(tempDir, "goros.config.ts"), 'export default { runtime: "bun" };', "utf8")

    const result = Bun.spawnSync({
      cmd: ["bun", mainCliPath, "doctor"],
      cwd: tempDir,
      stderr: "pipe",
      stdout: "pipe"
    })

    expect(result.exitCode).toBe(1)
    const stdout = new TextDecoder().decode(result.stdout)
    expect(stdout).toContain("app/routes missing")
  } finally {
    rmSync(tempDir, { recursive: true, force: true })
  }
})
