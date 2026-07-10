import fs from "node:fs"
import path from "node:path"
import type { RouteManifest } from "../scanner/route-manifest"
import { BoronixUserError } from "../core/errors"

export type BoronixBuildManifest = {
  version: 1
  frameworkVersion: string
  createdAt: string
  runtime: "bun" | "node"
  mode: "production"
  root: string
  routes: RouteManifest
  output: {
    directory: string
    serverEntry?: string
  }
}

export function readBuildManifest(root: string): BoronixBuildManifest {
  const manifestPath = path.join(root, ".boronix", "manifest.json")
  if (!fs.existsSync(manifestPath)) {
    throw new BoronixUserError(
      "Could not find .boronix/manifest.json.\nRun `boronix build` before `boronix start`.",
      {
        code: "KQ_BUILD_OUTPUT_NOT_FOUND",
        hint: "Run `boronix build` to generate the production build."
      }
    )
  }

  let content: string
  try {
    content = fs.readFileSync(manifestPath, "utf8")
  } catch (err: any) {
    throw new BoronixUserError("Could not read build manifest file.", {
      code: "KQ_BUILD_MANIFEST_INVALID",
      cause: err
    })
  }

  try {
    return JSON.parse(content) as BoronixBuildManifest
  } catch (err: any) {
    throw new BoronixUserError("Build manifest is invalid or corrupt.", {
      code: "KQ_BUILD_MANIFEST_INVALID",
      hint: "Run `boronix build` to recreate the manifest."
    })
  }
}

export function validateBuildManifest(manifest: any, startRuntime: "bun" | "node"): void {
  if (!manifest || typeof manifest !== "object") {
    throw new BoronixUserError("Build manifest is invalid or corrupt.", {
      code: "KQ_BUILD_MANIFEST_INVALID"
    })
  }

  // Handle version validation (Legacy 0.4.x might not have version)
  if (manifest.version === undefined || manifest.version !== 1) {
    throw new BoronixUserError(
      `Build manifest version ${manifest.version ?? "legacy"} is not supported. Rebuild with the current boronix version.`,
      {
        code: "KQ_BUILD_VERSION_UNSUPPORTED",
        hint: "Run `boronix build` to rebuild with the current version."
      }
    )
  }

  if (manifest.runtime !== "bun" && manifest.runtime !== "node") {
    throw new BoronixUserError(`Invalid runtime "${manifest.runtime}" in build manifest.`, {
      code: "KQ_BUILD_MANIFEST_INVALID"
    })
  }

  if (!Array.isArray(manifest.routes)) {
    throw new BoronixUserError("Build manifest routes list is invalid.", {
      code: "KQ_BUILD_MANIFEST_INVALID"
    })
  }

  // Build runtime must match start runtime
  if (manifest.runtime !== startRuntime) {
    throw new BoronixUserError(
      `This application was built for runtime "${manifest.runtime}" but is being started with "${startRuntime}".\nRebuild with the intended runtime.`,
      {
        code: "KQ_BUILD_RUNTIME_MISMATCH",
        hint: `Run \`boronix build --runtime ${startRuntime}\` first.`
      }
    )
  }

  // Check if serverEntry exists if requested
  if (manifest.output && manifest.output.serverEntry) {
    const entryPath = manifest.output.serverEntry
    if (!fs.existsSync(entryPath)) {
      throw new BoronixUserError(`Server entry file not found at: ${entryPath}`, {
        code: "KQ_BUILD_ENTRY_NOT_FOUND",
        hint: "Rebuild the application."
      })
    }
  }
}
