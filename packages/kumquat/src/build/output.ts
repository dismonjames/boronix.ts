import path from "node:path"
import { resetDir, writeTextFile } from "../utils/fs"
import type { BuildManifest } from "./manifest"

export function writeBuildOutput(root: string, manifest: BuildManifest): void {
  const outputDir = path.join(root, ".kumquat")
  resetDir(outputDir)
  writeTextFile(path.join(outputDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`)
}
