import os from "node:os"
import path from "node:path"
import { loadConfig } from "../../config/load-config"
import type { ResolvedKumquatConfig } from "../../config/types"
import { createKumquatApp } from "../../core/app"
import { KumquatUserError } from "../../core/errors"
import { selectRuntime } from "../../runtime/select"
import { scanRoutes } from "../../scanner/scan-routes"
import { resolvePath } from "../../utils/path"
import { initUiSettings, areColorsEnabled, getTerminalWidth } from "../ui/terminal"
import { colors } from "../ui/colors"
import { symbols } from "../ui/symbols"
import { startSpinner, updateSpinner, stopSpinner } from "../ui/spinner"
import { formatHeader } from "../ui/format"
import { formatRoutesSummary, getActionNames, getApiMethods, type CliRouteEntry } from "../ui/table"

export async function devCommand(
  root: string,
  options: {
    runtime?: ResolvedKumquatConfig["runtime"] | undefined
    port?: number | undefined
    host?: string | undefined
    plain?: boolean | undefined
    noColor?: boolean | undefined
  } = {}
): Promise<void> {
  // Initialize UI settings
  initUiSettings({ plain: options.plain, noColor: options.noColor })

  const startTime = performance.now()
  startSpinner("loading config")
  
  const config = await loadConfig(root)
  if (options.runtime) config.runtime = options.runtime
  if (options.port !== undefined) config.server.port = options.port
  if (options.host !== undefined) config.server.host = options.host

  updateSpinner("scanning routes")
  const routesDir = resolvePath(root, config.app.routesDir)
  const manifest = scanRoutes(routesDir)
  if (manifest.length === 0) {
    stopSpinner(true)
    throw new KumquatUserError("No routes found.", {
      code: "KQ_ROUTES_MISSING",
      file: config.app.routesDir,
      hint: "Create at least one route capsule like app/routes/home/page.html."
    })
  }

  updateSpinner("starting server")
  const app = createKumquatApp({ root, config, manifest, dev: true })
  const runtime = selectRuntime(config.runtime)

  try {
    runtime.serve({
      port: config.server.port,
      host: config.server.host,
      fetch: app.fetch
    })
  } catch (err: any) {
    stopSpinner(true)
    throw err
  }

  stopSpinner(true)

  const isPlain = !areColorsEnabled()
  console.log(formatHeader("dev", isPlain))
  console.log("")

  const homedir = os.homedir()
  const displayRoot = root.startsWith(homedir) ? root.replace(homedir, "~") : root

  if (isPlain) {
    console.log(`runtime: ${config.runtime}`)
    console.log(`local: http://${config.server.host === "0.0.0.0" ? "localhost" : config.server.host}:${config.server.port}`)
    console.log(`root: ${root}`)
    console.log("")
  } else {
    const width = getTerminalWidth()
    console.log(`  ${colors.muted("runtime")}  ${colors.bold(config.runtime)}`)
    console.log(`  ${colors.muted("local")}    ${colors.bold(`http://${config.server.host === "0.0.0.0" ? "localhost" : config.server.host}:${config.server.port}`)}`)
    if (width >= 100) {
      console.log(`  ${colors.muted("root")}     ${colors.bold(displayRoot)}`)
    }
    console.log("")
  }

  // Construct CLI route list
  const cliRoutes: CliRouteEntry[] = []
  const pageItems = manifest.filter(item => item.kind === "page")
  const apiItems = manifest.filter(item => item.kind === "api")

  for (const item of pageItems) {
    cliRoutes.push({
      symbol: "page",
      method: "GET",
      path: item.routePath,
      type: "page",
      source: path.relative(root, item.pageHtml || "")
    })
    if (item.actionsModule) {
      const actions = getActionNames(item.actionsModule)
      for (const act of actions) {
        cliRoutes.push({
          symbol: "action",
          method: "POST",
          path: `${item.routePath}?/${act}`,
          type: "action",
          source: path.relative(root, item.actionsModule)
        })
      }
    }
  }

  for (const item of apiItems) {
    const methods = getApiMethods(item.apiModule || "")
    for (const meth of methods) {
      cliRoutes.push({
        symbol: "api",
        method: meth,
        path: item.apiPath || item.routePath,
        type: "api",
        source: path.relative(root, item.apiModule || "")
      })
    }
  }

  console.log(formatRoutesSummary(cliRoutes, isPlain))
  console.log("")

  const duration = Math.round(performance.now() - startTime)
  if (isPlain) {
    console.log(`ready in ${duration}ms`)
  } else {
    console.log(`${colors.success(symbols.success())} ${colors.bold("ready")}, serving HTML in ${colors.bold(`${duration}ms`)}`)
  }
}
