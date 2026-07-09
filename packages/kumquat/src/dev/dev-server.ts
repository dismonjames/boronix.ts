import { loadConfig } from "../config/load-config"
import { createKumquatApp } from "../core/app"
import { logRoutes, logServer } from "./logger"
import { bunRuntime } from "../runtime/bun"
import { scanRoutes } from "../scanner/scan-routes"
import { resolvePath } from "../utils/path"

export async function startDevServer(root: string): Promise<void> {
  const config = await loadConfig(root)

  if (config.runtime !== "bun") {
    throw new Error("Only the Bun runtime is implemented in Kumquat v0.1.")
  }

  const manifest = scanRoutes(resolvePath(root, config.app.routesDir))
  const app = createKumquatApp({ root, config, manifest, dev: true })

  logRoutes(manifest)
  bunRuntime.serve({
    port: config.server.port,
    host: config.server.host,
    fetch: app.fetch
  })
  logServer(config.server.host, config.server.port)
}
