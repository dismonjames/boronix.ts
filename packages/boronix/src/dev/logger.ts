import type { RouteManifest } from "../scanner/route-manifest"
import type { ResolvedBoronixConfig } from "../config/types"

export function logRoutes(manifest: RouteManifest, runtime: ResolvedBoronixConfig["runtime"], root: string): void {
  console.log("Boronix dev server")
  console.log("")
  console.log(`runtime: ${runtime}`)
  console.log(`root: ${root}`)
  console.log("")
  console.log("routes:")

  for (const item of manifest) {
    if (item.kind === "api") {
      console.log(`  GET  ${(item.apiPath ?? "").padEnd(20)} api`)
    } else {
      console.log(`  GET  ${item.routePath.padEnd(20)} page`)
      if (item.actionsModule) {
        console.log(`  POST ${`${item.routePath}?/<action>`.padEnd(20)} action`)
      }
    }
  }
  console.log("")
}

export function logServer(host: string, port: number, runtime: ResolvedBoronixConfig["runtime"]): void {
  const localHost = host === "0.0.0.0" ? "localhost" : host
  console.log(`local: http://${localHost}:${port}`)
  console.log(`runtime ${runtime} listening`)
}
