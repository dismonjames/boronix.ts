import { expect, test } from "bun:test"
import { readFileSync, rmSync, existsSync } from "node:fs"
import os from "node:os"
import path from "node:path"

const generatorScriptPath = path.resolve("packages/create-goros/src/index.ts")

test("create generator CLI outputs valid project files", () => {
  const tempDir = path.join(os.tmpdir(), `goros-create-${Date.now()}`)
  const appPath = path.join(tempDir, "my-app")
  
  try {
    const result = Bun.spawnSync({
      cmd: ["bun", generatorScriptPath, appPath],
      stderr: "pipe",
      stdout: "pipe"
    })

    expect(result.exitCode).toBe(0)
    
    // Verify file existence
    expect(existsSync(path.join(appPath, "package.json"))).toBe(true)
    expect(existsSync(path.join(appPath, "goros.config.ts"))).toBe(true)
    expect(existsSync(path.join(appPath, "app/routes/home/page.html"))).toBe(true)

    // Verify scripts
    const pkg = JSON.parse(readFileSync(path.join(appPath, "package.json"), "utf8"))
    expect(pkg.scripts.dev).toBe("goros dev")
    expect(pkg.scripts.build).toBe("goros build")
    expect(pkg.scripts.start).toBe("goros start")
    expect(pkg.scripts.doctor).toBe("goros doctor")
  } finally {
    rmSync(tempDir, { recursive: true, force: true })
  }
})
