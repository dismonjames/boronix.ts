import type { RouteManifest, RouteManifestItem } from "../scanner/route-manifest"

export type RouteMatch = {
  item: RouteManifestItem
  params: Record<string, string>
}

export function matchRoute(manifest: RouteManifest, pathName: string, kind: "page" | "api"): RouteMatch | null {
  for (const item of manifest) {
    if (item.kind !== kind) continue

    const pattern = kind === "api" ? item.apiPath : item.routePath
    if (!pattern) continue

    const params = matchPath(pattern, pathName)
    if (params) {
      return { item, params }
    }
  }

  return null
}

export function matchPath(pattern: string, pathName: string): Record<string, string> | null {
  const patternSegments = splitPath(pattern)
  const pathSegments = splitPath(pathName)
  const params: Record<string, string> = {}

  for (let index = 0; index < patternSegments.length; index += 1) {
    const patternSegment = patternSegments[index]
    if (!patternSegment) return null

    if (patternSegment.startsWith("*")) {
      params[patternSegment.slice(1)] = pathSegments.slice(index).join("/")
      return params
    }

    const pathSegment = pathSegments[index]
    if (pathSegment == null) return null

    if (patternSegment.startsWith(":")) {
      params[patternSegment.slice(1)] = decodeURIComponent(pathSegment)
      continue
    }

    if (patternSegment !== pathSegment) return null
  }

  return patternSegments.length === pathSegments.length ? params : null
}

function splitPath(value: string): string[] {
  return value.split("/").filter(Boolean)
}
