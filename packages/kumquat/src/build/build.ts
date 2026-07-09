import path from "node:path"
import { loadConfig } from "../config/load-config"
import { scanRoutes } from "../scanner/scan-routes"
import { resolvePath } from "../utils/path"
import { writeBuildOutput } from "./output"

export async function build(root: string): Promise<void> {
  const config = await loadConfig(root)

  if (config.runtime !== "bun") {
    throw new Error("Only the Bun build target is implemented in Kumquat v0.1.")
  }

  const routes = scanRoutes(resolvePath(root, config.app.routesDir))
  writeBuildOutput(root, {
    target: "bun",
    routes
  })

  console.log(`Wrote ${path.join(root, ".kumquat", "manifest.json")}`)
}
