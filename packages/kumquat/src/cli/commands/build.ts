import os from "node:os"
import path from "node:path"
import { loadConfig } from "../../config/load-config"
import type { ResolvedKumquatConfig } from "../../config/types"
import { KumquatUserError } from "../../core/errors"
import { scanRoutes } from "../../scanner/scan-routes"
import { resolvePath } from "../../utils/path"
import { writeBuildOutput } from "../../build/output"
import { initUiSettings, areColorsEnabled } from "../ui/terminal"
import { colors } from "../ui/colors"
import { symbols } from "../ui/symbols"
import { formatHeader } from "../ui/format"
import { getActionNames, getApiMethods } from "../ui/table"

export async function buildCommand(
  root: string,
  options: {
    runtime?: ResolvedKumquatConfig["runtime"] | undefined
    plain?: boolean | undefined
    noColor?: boolean | undefined
  } = {}
): Promise<void> {
  initUiSettings({ plain: options.plain, noColor: options.noColor })

  const startTime = performance.now()
  const config = await loadConfig(root)
  const runtimeName = options.runtime ?? config.runtime

  if (runtimeName === "deno") {
    throw new KumquatUserError("Deno runtime is not implemented yet.", {
      code: "KQ_RUNTIME_UNSUPPORTED",
      hint: "Use `--runtime bun` or `--runtime node`."
    })
  }

  const routesDir = resolvePath(root, config.app.routesDir)
  const routes = scanRoutes(routesDir)
  if (routes.length === 0) {
    throw new KumquatUserError("No routes found.", {
      code: "KQ_ROUTES_MISSING",
      file: config.app.routesDir,
      hint: "Create at least one route capsule like app/routes/home/page.html."
    })
  }

  writeBuildOutput(root, {
    target: runtimeName,
    routes
  })

  const isPlain = !areColorsEnabled()
  console.log(formatHeader("build", isPlain))
  console.log("")

  const homedir = os.homedir()
  const displayRoot = root.startsWith(homedir) ? root.replace(homedir, "~") : root

  if (isPlain) {
    console.log(`runtime: ${runtimeName}`)
    console.log(`root: ${root}`)
    console.log(`output: .kumquat`)
    console.log("")
  } else {
    console.log(`  ${colors.muted("runtime")}  ${colors.bold(runtimeName)}`)
    console.log(`  ${colors.muted("root")}     ${colors.bold(displayRoot)}`)
    console.log(`  ${colors.muted("output")}   ${colors.bold(".kumquat")}`)
    console.log("")
  }

  // Collect route summary entries
  const summaryEntries: { symbol: "page" | "api" | "action"; path: string; type: string }[] = []
  const pageItems = routes.filter(item => item.kind === "page")
  const apiItems = routes.filter(item => item.kind === "api")

  for (const item of pageItems) {
    summaryEntries.push({
      symbol: "page",
      path: item.routePath,
      type: "page"
    })
    if (item.actionsModule) {
      const actions = getActionNames(item.actionsModule)
      for (const act of actions) {
        summaryEntries.push({
          symbol: "action",
          path: `${item.routePath}?/${act}`,
          type: "action"
        })
      }
    }
  }

  for (const item of apiItems) {
    summaryEntries.push({
      symbol: "api",
      path: item.apiPath || item.routePath,
      type: "api"
    })
  }

  console.log(formatBuildSummary(summaryEntries, isPlain))
  console.log("")

  const duration = Math.round(performance.now() - startTime)
  if (isPlain) {
    console.log(`built in ${duration}ms`)
  } else {
    console.log(`${colors.success(symbols.success())} ${colors.bold("built server-rendered app")} in ${colors.bold(`${duration}ms`)}`)
  }
}

function formatBuildSummary(
  routes: { symbol: "page" | "api" | "action"; path: string; type: string }[],
  isPlain: boolean
): string {
  if (isPlain) {
    const lines = ["Routes:"]
    for (const r of routes) {
      lines.push(`${r.path} ${r.type}`)
    }
    return lines.join("\n")
  }

  const maxPathLen = Math.max(...routes.map(r => r.path.length), 1)
  const lines = ["  route summary"]
  for (const r of routes) {
    const sym = r.symbol === "page" ? symbols.page() : symbols.fn()
    const symColored = r.symbol === "page" ? colors.success(sym) : colors.brand(sym)
    const pt = colors.path(r.path.padEnd(maxPathLen))
    const tp = colors.muted(r.type)
    lines.push(`  ${symColored}  ${pt}  ${tp}`)
  }
  return lines.join("\n")
}
