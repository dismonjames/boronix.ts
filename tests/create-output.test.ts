import { expect, test } from "bun:test"
import { rmSync, existsSync } from "node:fs"
import os from "node:os"
import path from "node:path"

const generatorScriptPath = path.resolve("packages/create-kumquat/src/index.ts")

test("create generator CLI outputs visually styled next steps", () => {
  const tempDir = path.join(os.tmpdir(), `kumquat-create-out-${Date.now()}`)
  const appPath = path.join(tempDir, "my-app")
  
  try {
    const result = Bun.spawnSync({
      cmd: ["bun", generatorScriptPath, appPath],
      stderr: "pipe",
      stdout: "pipe"
    })

    expect(result.exitCode).toBe(0)
    const stdout = new TextDecoder().decode(result.stdout)
    expect(stdout).toContain("create-kumquat")
    expect(stdout).toContain("project")
    expect(stdout).toContain("template")
    expect(stdout).toContain("runtime")
    expect(stdout).toContain("created project")
    expect(stdout).toContain("Next steps")
    expect(stdout).toContain("➜")
    expect(stdout).toContain("Then open")
  } finally {
    rmSync(tempDir, { recursive: true, force: true })
  }
})
