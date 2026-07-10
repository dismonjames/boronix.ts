import { expect, test } from "bun:test"
import { mkdirSync, rmSync } from "node:fs"
import os from "node:os"
import path from "node:path"

const mainCliPath = path.resolve("packages/boronix/src/cli/main.ts")

test("invalid runtime flag gives useful cli error", () => {
  const result = Bun.spawnSync({
    cmd: ["bun", mainCliPath, "dev", "--runtime", "bad"],
    cwd: path.resolve("."),
    stderr: "pipe",
    stdout: "pipe"
  })

  expect(result.exitCode).toBe(1)
  const stderr = new TextDecoder().decode(result.stderr)
  expect(stderr).toContain("KQ_RUNTIME_UNSUPPORTED")
  expect(stderr).toContain("Invalid runtime: bad")
})

test("missing production manifest gives useful start error", () => {
  const tempDir = path.join(os.tmpdir(), `boronix-start-err-${Date.now()}`)
  mkdirSync(tempDir, { recursive: true })

  try {
    const result = Bun.spawnSync({
      cmd: ["bun", mainCliPath, "start"],
      cwd: tempDir,
      stderr: "pipe",
      stdout: "pipe"
    })

    expect(result.exitCode).toBe(1)
    const stderr = new TextDecoder().decode(result.stderr)
    expect(stderr).toContain("KQ_BUILD_OUTPUT_NOT_FOUND")
    expect(stderr).toContain("Could not find .boronix/manifest.json")
  } finally {
    rmSync(tempDir, { recursive: true, force: true })
  }
})

test("missing app routes gives useful build error", () => {
  const tempDir = path.join(os.tmpdir(), `boronix-build-err-${Date.now()}`)
  mkdirSync(tempDir, { recursive: true })

  try {
    const result = Bun.spawnSync({
      cmd: ["bun", mainCliPath, "build"],
      cwd: tempDir,
      stderr: "pipe",
      stdout: "pipe"
    })

    expect(result.exitCode).toBe(1)
    const stderr = new TextDecoder().decode(result.stderr)
    expect(stderr).toContain("KQ_ROUTES_MISSING")
    expect(stderr).toContain("No routes found.")
  } finally {
    rmSync(tempDir, { recursive: true, force: true })
  }
})
