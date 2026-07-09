import { expect, test } from "bun:test"
import { rmSync, existsSync, readFileSync } from "node:fs"
import os from "node:os"
import path from "node:path"

const scriptPath = path.resolve("packages/create-goros/src/index.ts")

test("create-goros basic template non-interactive", () => {
  const tempDir = path.join(os.tmpdir(), `goros-nonint-basic-${Date.now()}`)
  const appPath = path.join(tempDir, "my-app")

  try {
    const result = Bun.spawnSync({
      cmd: ["bun", scriptPath, appPath, "--template", "basic", "--runtime", "bun", "--no-install", "--no-git"],
      stderr: "pipe",
      stdout: "pipe"
    })

    expect(result.exitCode).toBe(0)
    expect(existsSync(path.join(appPath, "package.json"))).toBe(true)
    expect(existsSync(path.join(appPath, "goros.config.ts"))).toBe(true)
    
    const pkg = JSON.parse(readFileSync(path.join(appPath, "package.json"), "utf8"))
    expect(pkg.name).toBe("my-app")
    expect(pkg.dependencies.goros).toBe("^0.2.5")
  } finally {
    rmSync(tempDir, { recursive: true, force: true })
  }
})

test("create-goros homework template non-interactive", () => {
  const tempDir = path.join(os.tmpdir(), `goros-nonint-hw-${Date.now()}`)
  const appPath = path.join(tempDir, "my-app")

  try {
    const result = Bun.spawnSync({
      cmd: ["bun", scriptPath, appPath, "--template", "homework", "--runtime", "node", "--no-install", "--no-git"],
      stderr: "pipe",
      stdout: "pipe"
    })

    expect(result.exitCode).toBe(0)
    expect(existsSync(path.join(appPath, "package.json"))).toBe(true)
    expect(existsSync(path.join(appPath, "goros.config.ts"))).toBe(true)
    
    const config = readFileSync(path.join(appPath, "goros.config.ts"), "utf8")
    expect(config).toContain('runtime: "node"')
  } finally {
    rmSync(tempDir, { recursive: true, force: true })
  }
})
