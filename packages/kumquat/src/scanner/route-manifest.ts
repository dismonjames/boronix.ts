export type RouteManifestItem = {
  kind: "page" | "api"
  routePath: string
  apiPath?: string
  params: string[]
  routeDir: string
  pageHtml?: string
  pageModule?: string
  apiModule?: string
  actionsModule?: string
}

export type RouteManifest = RouteManifestItem[]
