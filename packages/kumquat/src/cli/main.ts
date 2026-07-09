#!/usr/bin/env bun
import path from "node:path"
import { buildCommand } from "./commands/build"
import { devCommand } from "./commands/dev"
import { startCommand } from "./commands/start"

type CliOptions = {
  command: string
  root: string
}

async function main(argv: string[]): Promise<void> {
  const options = parseArgs(argv)

  if (options.command === "dev") {
    await devCommand(options.root)
    return
  }

  if (options.command === "build") {
    await buildCommand(options.root)
    return
  }

  if (options.command === "start") {
    await startCommand(options.root)
    return
  }

  console.error("Usage: kumquat <dev|build|start> [--root <dir>]")
  process.exit(1)
}

function parseArgs(argv: string[]): CliOptions {
  const command = argv[2] ?? "dev"
  const rootFlagIndex = argv.indexOf("--root")
  const root = rootFlagIndex >= 0 ? argv[rootFlagIndex + 1] : "."

  return {
    command,
    root: path.resolve(root ?? ".")
  }
}

main(process.argv).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
