import { existsSync, readFileSync } from "node:fs"
import { symbols } from "./symbols"
import { colors } from "./colors"
import { getTerminalWidth } from "./terminal"

export type CliRouteEntry = {
  symbol: "page" | "api" | "action"
  method: string
  path: string
  type: "page" | "api" | "action"
  source?: string
}

export function getActionNames(actionsFilePath: string): string[] {
  if (!actionsFilePath || !existsSync(actionsFilePath)) return ["<action>"]
  try {
    const content = readFileSync(actionsFilePath, "utf8")
    const matches = content.matchAll(/export\s+(?:const|let|var|function|async\s+function)\s+([a-zA-Z0-9_$]+)/g)
    const names = Array.from(matches)
      .map(m => m[1])
      .filter((name): name is string => typeof name === "string" && name !== "default")
    if (names.length === 0) {
      return ["<action>"]
    }
    return names
  } catch {
    return ["<action>"]
  }
}

export function getApiMethods(apiFilePath: string): string[] {
  if (!apiFilePath || !existsSync(apiFilePath)) return ["GET"]
  try {
    const content = readFileSync(apiFilePath, "utf8")
    const matches = content.matchAll(/export\s+(?:const|let|var|function|async\s+function)\s+([a-zA-Z0-9_$]+)/g)
    const methods = Array.from(matches)
      .map(m => m[1])
      .filter((m): m is string => typeof m === "string")
      .map(m => m.toUpperCase())
      .filter(m => ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"].includes(m))
    if (methods.length === 0) {
      return ["GET"]
    }
    return methods
  } catch {
    return ["GET"]
  }
}

function truncatePath(p: string, maxLen: number): string {
  if (p.length <= maxLen) return p
  if (maxLen <= 5) return "..."
  return p.slice(0, maxLen - 3) + "..."
}

export function formatRoutesSummary(routes: CliRouteEntry[], isPlainMode: boolean): string {
  if (routes.length === 0) return ""

  if (isPlainMode) {
    const lines = ["Routes:"]
    for (const route of routes) {
      lines.push(`${route.method} ${route.path} ${route.type}`)
    }
    return lines.join("\n")
  }

  const width = getTerminalWidth()

  if (width >= 100) {
    // Show icon, method, path, type, source
    const rawSymbols = routes.map(r => r.symbol === "page" ? symbols.page() : symbols.fn())
    const maxSymbolWidth = Math.max(...rawSymbols.map(s => s.length), 1)
    const maxMethodWidth = Math.max(...routes.map(r => r.method.length), 4)
    const maxPathWidth = Math.max(...routes.map(r => r.path.length), 1)
    const maxTypeWidth = Math.max(...routes.map(r => r.type.length), 4)

    const lines = ["  routes"]
    for (const route of routes) {
      const symRaw = route.symbol === "page" ? symbols.page() : symbols.fn()
      const symColor = route.symbol === "page" ? colors.success(symRaw) : colors.brand(symRaw)
      
      const symPad = symRaw.padEnd(maxSymbolWidth)
      const sym = symPad.replace(symRaw, symColor)

      const meth = colors.method(route.method.padEnd(maxMethodWidth))
      const pt = colors.path(route.path.padEnd(maxPathWidth))
      const tp = colors.muted(route.type.padEnd(maxTypeWidth))

      // Spacing:
      // '  ' (2) + sym (maxSymbolWidth) + '  ' (2) + meth (maxMethodWidth) + '  ' (2) + pt (maxPathWidth) + '  ' (2) + tp (maxTypeWidth) + '  ' (2)
      const prefixLen = 2 + maxSymbolWidth + 2 + maxMethodWidth + 2 + maxPathWidth + 2 + maxTypeWidth + 2
      const remainingWidth = Math.max(0, width - prefixLen)
      
      const rawSrc = route.source ?? ""
      const truncatedSrc = truncatePath(rawSrc, remainingWidth)
      const src = colors.source(truncatedSrc)

      lines.push(`  ${sym}  ${meth}  ${pt}  ${tp}  ${src}`)
    }
    return lines.join("\n")
  }

  if (width >= 70) {
    // Show icon, method, path, type
    const rawSymbols = routes.map(r => r.symbol === "page" ? symbols.page() : symbols.fn())
    const maxSymbolWidth = Math.max(...rawSymbols.map(s => s.length), 1)
    const maxMethodWidth = Math.max(...routes.map(r => r.method.length), 4)
    const maxPathWidth = Math.max(...routes.map(r => r.path.length), 1)

    const lines = ["  routes"]
    for (const route of routes) {
      const symRaw = route.symbol === "page" ? symbols.page() : symbols.fn()
      const symColor = route.symbol === "page" ? colors.success(symRaw) : colors.brand(symRaw)
      const sym = symRaw.padEnd(maxSymbolWidth).replace(symRaw, symColor)

      const meth = colors.method(route.method.padEnd(maxMethodWidth))
      const pt = colors.path(route.path.padEnd(maxPathWidth))
      const tp = colors.muted(route.type)

      lines.push(`  ${sym}  ${meth}  ${pt}  ${tp}`)
    }
    return lines.join("\n")
  }

  if (width >= 50) {
    // Show icon, path, type
    const rawSymbols = routes.map(r => r.symbol === "page" ? symbols.page() : symbols.fn())
    const maxSymbolWidth = Math.max(...rawSymbols.map(s => s.length), 1)
    const maxPathWidth = Math.max(...routes.map(r => r.path.length), 1)

    const lines = ["  routes"]
    for (const route of routes) {
      const symRaw = route.symbol === "page" ? symbols.page() : symbols.fn()
      const symColor = route.symbol === "page" ? colors.success(symRaw) : colors.brand(symRaw)
      const sym = symRaw.padEnd(maxSymbolWidth).replace(symRaw, symColor)

      const pt = colors.path(route.path.padEnd(maxPathWidth))
      const tp = colors.muted(route.type)

      lines.push(`  ${sym}  ${pt}  ${tp}`)
    }
    return lines.join("\n")
  }

  // Narrow list mode (< 50 columns)
  const lines = ["  routes"]
  for (let i = 0; i < routes.length; i++) {
    const route = routes[i]
    if (!route) continue
    const symRaw = route.symbol === "page" ? symbols.page() : symbols.fn()
    const symColor = route.symbol === "page" ? colors.success(symRaw) : colors.brand(symRaw)
    
    lines.push(`  ${symColor} ${colors.path(route.path)}`)
    lines.push(`    ${colors.method(route.method)} ${colors.muted(route.type)}`)
    if (i < routes.length - 1) {
      lines.push("")
    }
  }
  return lines.join("\n")
}
