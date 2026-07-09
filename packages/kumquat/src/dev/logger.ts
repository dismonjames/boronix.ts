import type { RouteManifest } from "../scanner/route-manifest"

export function logRoutes(manifest: RouteManifest): void {
  console.log("Kumquat routes")

  for (const item of manifest) {
    if (item.kind === "api") {
      console.log(`  API   ${item.apiPath}`)
    } else {
      console.log(`  PAGE  ${item.routePath}`)
    }
  }
}

export function logServer(host: string, port: number): void {
  console.log(`Kumquat dev server listening on http://${host}:${port}`)
}
