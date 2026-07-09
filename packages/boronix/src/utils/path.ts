import path from "node:path"

export function resolvePath(root: string, filePath: string): string {
  return path.resolve(root, filePath)
}

export function toPosixPath(filePath: string): string {
  return filePath.split(path.sep).join("/")
}

export function stripTrailingSlash(value: string): string {
  if (value === "/") return value
  return value.replace(/\/+$/, "")
}
