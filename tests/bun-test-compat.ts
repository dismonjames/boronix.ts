import { expect, test, it, describe, beforeAll, afterAll, beforeEach, afterEach, vi } from "vitest"
import { spawnSync, spawn } from "node:child_process"
import fs from "node:fs"
import { createRequire } from "node:module"

export { expect, test, it, describe, beforeAll, afterAll, beforeEach, afterEach }

export const mock = vi.fn
export const spyOn = vi.spyOn
export const fn = vi.fn

const requireHelper = createRequire(import.meta.url)
let tsxLoader: string
try {
  tsxLoader = import.meta.resolve("tsx")
} catch {
  tsxLoader = requireHelper.resolve("tsx")
}

// Compatibility layer for Bun globals used in the test suite
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const bunSpawnSync = (options: any) => {
  // Translate command and runtime to node
  let cmd = options.cmd || []
  if (cmd[0] === "bun") {
    // If the command is running bun command, translate to node/tsx
    if (cmd[1] && cmd[1].endsWith("main.ts")) {
      cmd = ["node", `--import=${tsxLoader}`, ...cmd.slice(1)]
    } else {
      cmd = ["node", ...cmd.slice(1)]
    }
  }

  const result = spawnSync(cmd[0], cmd.slice(1), {
    cwd: options.cwd,
    env: { ...process.env, ...options.env },
    input: options.stdin || ""
  })
  return {
    success: result.status === 0,
    exitCode: result.status,
    stdout: result.stdout,
    stderr: result.stderr
  }
}

const bunSpawn = (options: any) => {
  let cmd = options.cmd || []
  if (cmd[0] === "bun") {
    if (cmd[1] && cmd[1].endsWith("main.ts")) {
      cmd = ["node", `--import=${tsxLoader}`, ...cmd.slice(1)]
    } else {
      cmd = ["node", ...cmd.slice(1)]
    }
  }

  const child = spawn(cmd[0], cmd.slice(1), {
    cwd: options.cwd,
    env: { ...process.env, ...options.env }
  })

  const exited = new Promise<any>((resolve) => {
    child.on("exit", (code) => resolve({ exitCode: code }))
    child.on("error", () => resolve({ exitCode: 1 }))
  })

  return {
    pid: child.pid,
    kill: (signal?: string) => child.kill(signal as any),
    exited,
    get stdout() {
      // Mock stream reader
      return {
        getReader() {
          let ended = false
          return {
            async read() {
              if (ended) return { done: true, value: undefined }
              return new Promise((resolve) => {
                child.stdout?.once("data", (chunk) => {
                  resolve({ done: false, value: chunk })
                })
                child.stdout?.once("end", () => {
                  ended = true
                  resolve({ done: true, value: undefined })
                })
              })
            }
          }
        }
      }
    },
    get stderr() {
      return {
        getReader() {
          let ended = false
          return {
            async read() {
              if (ended) return { done: true, value: undefined }
              return new Promise((resolve) => {
                child.stderr?.once("data", (chunk) => {
                  resolve({ done: false, value: chunk })
                })
                child.stderr?.once("end", () => {
                  ended = true
                  resolve({ done: true, value: undefined })
                })
              })
            }
          }
        }
      }
    }
  }
}

const bunWrite = async (path: string, content: string) => {
  fs.writeFileSync(path, content, "utf8")
  return content.length
}

const bunFile = (path: string) => {
  return {
    text: async () => fs.readFileSync(path, "utf8"),
    json: async () => JSON.parse(fs.readFileSync(path, "utf8")),
    exists: async () => fs.existsSync(path),
    size: fs.existsSync(path) ? fs.statSync(path).size : 0
  }
}

if (typeof (globalThis as any).Bun === "undefined") {
  ;(globalThis as any).Bun = {
    isCompatMock: true,
    spawnSync: bunSpawnSync,
    spawn: bunSpawn,
    sleep,
    write: bunWrite,
    file: bunFile,
    gc: () => { if (globalThis.gc) globalThis.gc() }
  }
}
