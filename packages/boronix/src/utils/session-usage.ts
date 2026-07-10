import fs from "node:fs"
import path from "node:path"

export function detectSessionUsage(root: string): boolean {
  const appDir = path.resolve(root, "app")
  if (!fs.existsSync(appDir)) return false

  const filesToScan: string[] = []
  
  function recurse(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        if (entry.name !== "node_modules" && entry.name !== ".boronix") {
          recurse(fullPath)
        }
      } else if (entry.isFile() && /\.(ts|js|tsx|jsx)$/.test(entry.name)) {
        filesToScan.push(fullPath)
      }
    }
  }

  try {
    recurse(appDir)
  } catch {
    return false
  }

  for (const file of filesToScan) {
    try {
      const content = fs.readFileSync(file, "utf8")
      if (/\b(session|auth)\b/.test(content)) {
        return true
      }
    } catch {}
  }

  return false
}
