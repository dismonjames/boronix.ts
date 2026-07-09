import path from "node:path"
import { KumquatUserError } from "../core/errors"

export type CliArgs = {
  command?: string | undefined
  root: string
  runtime?: "bun" | "node" | "deno" | undefined
  port?: number | undefined
  host?: string | undefined
  plain: boolean
  noColor: boolean
  help: boolean
  version: boolean
}

export function parseCliArgs(argv: string[]): CliArgs {
  const args = argv.slice(2)
  let command: string | undefined = undefined
  let root = "."
  let runtime: "bun" | "node" | "deno" | undefined = undefined
  let port: number | undefined = undefined
  let host: string | undefined = undefined
  let plain = false
  let noColor = false
  let help = false
  let version = false

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === undefined) continue
    if (arg === "-h" || arg === "--help") {
      help = true
    } else if (arg === "-v" || arg === "--version") {
      version = true
    } else if (arg === "--plain") {
      plain = true
    } else if (arg === "--no-color") {
      noColor = true
    } else if (arg === "--root") {
      const val = args[i + 1]
      if (val && !val.startsWith("-")) {
        root = val
        i++
      }
    } else if (arg === "--runtime") {
      const val = args[i + 1]
      if (val === "bun" || val === "node" || val === "deno") {
        runtime = val
        i++
      } else if (val) {
        throw new KumquatUserError(`Invalid runtime: ${val}`, {
          code: "KQ_RUNTIME_UNSUPPORTED",
          hint: "Supported runtimes are: bun | node"
        })
      }
    } else if (arg === "-p" || arg === "--port") {
      const val = args[i + 1]
      if (val && !val.startsWith("-")) {
        port = parseInt(val, 10)
        if (isNaN(port)) {
          throw new Error(`Invalid port: ${val}`)
        }
        i++
      }
    } else if (arg === "-H" || arg === "--host") {
      const val = args[i + 1]
      if (val && !val.startsWith("-")) {
        host = val
        i++
      }
    } else if (!arg.startsWith("-")) {
      if (!command) {
        command = arg
      }
    }
  }

  return {
    command,
    root: path.resolve(root),
    runtime,
    port,
    host,
    plain,
    noColor,
    help,
    version
  }
}
