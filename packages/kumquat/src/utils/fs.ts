import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import path from "node:path"

export function readTextFile(filePath: string): string {
  return readFileSync(filePath, "utf8")
}

export function writeTextFile(filePath: string, contents: string): void {
  mkdirSync(path.dirname(filePath), { recursive: true })
  writeFileSync(filePath, contents)
}

export function resetDir(dirPath: string): void {
  if (existsSync(dirPath)) {
    rmSync(dirPath, { recursive: true, force: true })
  }
  mkdirSync(dirPath, { recursive: true })
}
