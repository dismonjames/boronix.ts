import { colors } from "./colors"
import { symbols } from "./symbols"

export function logRequest(
  method: string,
  pathname: string,
  status: number,
  kind: "serve" | "render" | "api" | "action" | "miss" | "error",
  duration: number,
  extra?: string,
  showKind = true
) {
  let sym = ""
  let statusStr = String(status)

  if (status >= 200 && status < 300) {
    sym = colors.success(symbols.success())
    statusStr = colors.success(statusStr)
  } else if (status >= 300 && status < 400) {
    sym = colors.brand(symbols.redirect())
    statusStr = colors.brand(statusStr)
  } else if (status >= 400 && status < 500) {
    sym = colors.warning(symbols.warning())
    statusStr = colors.warning(statusStr)
  } else {
    sym = colors.error(symbols.error())
    statusStr = colors.error(statusStr)
  }

  const methodStr = colors.method(method.padEnd(6))
  const pathStr = colors.path(pathname.padEnd(22))
  const durationStr = colors.muted(`${duration}ms`)
  const extraStr = extra ? `  ${colors.muted(extra)}` : ""

  if (showKind) {
    const kindStr = colors.muted(kind.padEnd(7))
    console.log(`${methodStr} ${pathStr} ${sym} ${statusStr}  ${kindStr} ${durationStr}${extraStr}`)
  } else {
    console.log(`${methodStr} ${pathStr} ${sym} ${statusStr}  ${durationStr}${extraStr}`)
  }
}

export function isStaticAsset(pathname: string): boolean {
  if (pathname.includes("?")) {
    pathname = pathname.split("?")[0] ?? ""
  }
  const parts = pathname.split(".")
  if (parts.length <= 1) return false
  const ext = parts.pop()
  if (!ext) return false
  return ["css", "js", "png", "jpg", "jpeg", "svg", "ico", "woff", "woff2", "ttf", "json"].includes(ext.toLowerCase())
}
