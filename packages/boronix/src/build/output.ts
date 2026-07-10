import fs from "node:fs"
import path from "node:path"
import { BoronixUserError } from "../core/errors"
import { validateBuildManifest } from "./manifest"
import type { BoronixBuildManifest } from "./manifest"

export function writeBuildOutput(root: string, manifest: BoronixBuildManifest): void {
  const tmpDir = path.join(root, ".boronix.tmp")
  const outputDir = path.join(root, ".boronix")

  try {
    // 1. Build to .boronix.tmp
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true })
    }
    fs.mkdirSync(tmpDir, { recursive: true })

    // Write manifest to tmpDir
    const manifestTmpPath = path.join(tmpDir, "manifest.json")
    fs.writeFileSync(manifestTmpPath, `${JSON.stringify(manifest, null, 2)}\n`)

    // Copy .boronix/types if it exists
    const typesDir = path.join(outputDir, "types")
    if (fs.existsSync(typesDir)) {
      fs.mkdirSync(path.join(tmpDir, "types"), { recursive: true })
      fs.cpSync(typesDir, path.join(tmpDir, "types"), { recursive: true })
    }

    // 2. Validate output
    const readManifest = JSON.parse(fs.readFileSync(manifestTmpPath, "utf8"))
    validateBuildManifest(readManifest, manifest.runtime)

    // 3. Delete or rotate .boronix
    const bakDir = path.join(root, ".boronix.bak")
    if (fs.existsSync(bakDir)) {
      fs.rmSync(bakDir, { recursive: true, force: true })
    }
    if (fs.existsSync(outputDir)) {
      fs.renameSync(outputDir, bakDir)
    }

    // 4. Rename .boronix.tmp to .boronix
    fs.renameSync(tmpDir, outputDir)

    // Delete the bak directory
    if (fs.existsSync(bakDir)) {
      fs.rmSync(bakDir, { recursive: true, force: true })
    }
  } catch (err: any) {
    // 5. Cleanup .boronix.tmp if failed
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true })
    }
    throw new BoronixUserError(`Failed to write build output atomically: ${err.message}`, {
      code: "KQ_BUILD_OUTPUT_WRITE_FAILED",
      cause: err
    })
  }
}
