#!/usr/bin/env bun
import { cpSync, existsSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const packageRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const templateDir = path.join(packageRoot, "src", "templates", "basic")
const targetArg = process.argv[2]

if (!targetArg) {
  console.error("Usage: create-kumquat <app-name>")
  process.exit(1)
}

const targetDir = path.resolve(targetArg)

if (existsSync(targetDir)) {
  console.error(`Target already exists: ${targetDir}`)
  process.exit(1)
}

cpSync(templateDir, targetDir, { recursive: true })
console.log(`Created Kumquat app at ${targetDir}`)
