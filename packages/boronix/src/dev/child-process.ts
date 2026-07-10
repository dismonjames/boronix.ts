import { spawn, spawnSync } from "node:child_process"
import { createRequire } from "node:module"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { decodeDevMessage, type ChildToSupervisorMessage, type SupervisorToChildMessage } from "./protocol"
import { BoronixUserError } from "../core/errors"

export type DevChildOptions = {
  root: string
  runtime: "bun" | "node" | "deno"
  port?: number | undefined
  host?: string | undefined
  revision: number
  quiet?: boolean | undefined
  verbose?: boolean | undefined
  plain?: boolean | undefined
  noColor?: boolean | undefined
  reloadEnabled: boolean
  onMessage(message: ChildToSupervisorMessage): void
  onOutput(line: string, isError: boolean): void
  onExit(code: number | null, signal: NodeJS.Signals | null): void
}

export type DevChild = {
  pid: number | undefined
  send(message: SupervisorToChildMessage): void
  stop(reason: string, timeoutMs?: number): Promise<void>
}

function workerEntry(): string {
  const source = fileURLToPath(new URL("./worker.ts", import.meta.url))
  const built = fileURLToPath(new URL("../../dist/dev/worker.js", import.meta.url))
  return import.meta.url.endsWith(".ts") ? source : built
}

function resolveNodeExecutable(): string {
  const executable = process.env.BORONIX_NODE_EXECUTABLE || "node"
  const probe = spawnSync(executable, ["--version"], { stdio: "ignore" })
  if (probe.error || probe.status !== 0) {
    throw new BoronixUserError("Node.js is required for runtime \"node\".", {
      code: "KQ_NODE_RUNTIME_NOT_FOUND",
      hint: "Install Node.js or use --runtime bun."
    })
  }
  return executable
}

function resolveBunExecutable(): string {
  const executable = process.env.BORONIX_BUN_EXECUTABLE || "bun"
  const probe = spawnSync(executable, ["--version"], { stdio: "ignore" })
  if (probe.error || probe.status !== 0) {
    throw new BoronixUserError("Bun is required for runtime \"bun\".\nInstall Bun or use runtime \"node\".", {
      code: "KQ_BUN_RUNTIME_NOT_FOUND",
      hint: "Install Bun or run using --runtime node."
    })
  }
  return executable
}

function assertProjectTsx(root: string): void {
  try {
    const selfRequire = createRequire(import.meta.url)
    selfRequire.resolve("tsx/package.json")
  } catch {
    try {
      const projectRequire = createRequire(path.join(root, "package.json"))
      projectRequire.resolve("tsx/package.json")
    } catch {
      throw new BoronixUserError("The Node development runtime requires \"tsx\" to execute TypeScript.", {
        code: "KQ_NODE_TS_RUNTIME_MISSING",
        hint: "Install it with:\n\nnpm install --save-dev tsx"
      })
    }
  }
}

export function spawnDevChild(options: DevChildOptions): DevChild {
  const isNode = options.runtime === "node"
  if (isNode) assertProjectTsx(options.root)
  const command = isNode ? resolveNodeExecutable() : resolveBunExecutable()

  let nodeArgs: string[] = []
  if (isNode) {
    let loaderPath = "tsx"
    try {
      loaderPath = import.meta.resolve("tsx")
    } catch {
      try {
        const selfRequire = createRequire(import.meta.url)
        loaderPath = selfRequire.resolve("tsx")
      } catch {
        try {
          const projectRequire = createRequire(path.join(options.root, "package.json"))
          loaderPath = projectRequire.resolve("tsx")
        } catch {}
      }
    }
    nodeArgs.push(`--import=${loaderPath}`)
  }

  const args = [
    ...nodeArgs,
    workerEntry(), "--root", options.root, "--runtime", options.runtime, "--revision", String(options.revision)
  ]
  if (options.port !== undefined) args.push("--port", String(options.port))
  if (options.host !== undefined) args.push("--host", options.host)
  if (options.quiet) args.push("--quiet")
  if (options.verbose) args.push("--verbose")
  if (options.plain) args.push("--plain")
  if (options.noColor) args.push("--no-color")
  if (!options.reloadEnabled) args.push("--no-reload")

  const child = spawn(command, args, { cwd: options.root, stdio: ["pipe", "pipe", "pipe"] })
  let stopping = false
  let exited = false
  let stdoutBuffer = ""
  let stderrBuffer = ""

  function consume(chunk: Buffer | string, isError: boolean): void {
    let buffer = (isError ? stderrBuffer : stdoutBuffer) + chunk.toString()
    const lines = buffer.split(/\r?\n/)
    buffer = lines.pop() ?? ""
    if (isError) stderrBuffer = buffer
    else stdoutBuffer = buffer
    for (const line of lines) {
      const message = !isError ? decodeDevMessage(line) : undefined
      if (message) options.onMessage(message)
      else if (line) options.onOutput(line, isError)
    }
  }

  child.stdout?.on("data", (chunk) => consume(chunk, false))
  child.stderr?.on("data", (chunk) => consume(chunk, true))
  child.on("exit", (code, signal) => {
    exited = true
    options.onExit(code, signal)
  })

  return {
    get pid() { return child.pid },
    send(message) {
      if (!exited && child.stdin?.writable) child.stdin.write(`${JSON.stringify(message)}\n`)
    },
    async stop(reason, timeoutMs = 3000) {
      if (exited || stopping) return
      stopping = true
      this.send({ type: "shutdown", reason })
      await new Promise<void>((resolve) => {
        const timer = setTimeout(() => {
          if (!exited) child.kill("SIGTERM")
          setTimeout(() => {
            if (!exited) child.kill("SIGKILL")
            resolve()
          }, 1000)
        }, timeoutMs)
        child.once("exit", () => {
          clearTimeout(timer)
          resolve()
        })
      })
    }
  }
}
