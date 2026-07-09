import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { loadConfig } from "../../config/load-config"
import { createKumquatApp } from "../../core/app"
import { bunRuntime } from "../../runtime/bun"
import type { BuildManifest } from "../../build/manifest"

export async function startCommand(root: string): Promise<void> {
  const manifestPath = path.join(root, ".kumquat", "manifest.json")

  if (!existsSync(manifestPath)) {
    throw new Error("Run kumquat build first.")
  }

  const config = await loadConfig(root)
  const buildManifest = JSON.parse(readFileSync(manifestPath, "utf8")) as BuildManifest
  const app = createKumquatApp({ root, config, manifest: buildManifest.routes })

  bunRuntime.serve({
    port: config.server.port,
    host: config.server.host,
    fetch: app.fetch
  })

  console.log(`Kumquat server listening on http://${config.server.host}:${config.server.port}`)
}
