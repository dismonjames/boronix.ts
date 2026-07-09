export function parseRouteParams(routePath: string): string[] {
  return routePath
    .split("/")
    .filter(Boolean)
    .filter((segment) => segment.startsWith(":") || segment.startsWith("*"))
    .map((segment) => segment.replace(/^[:*]/, ""))
}
