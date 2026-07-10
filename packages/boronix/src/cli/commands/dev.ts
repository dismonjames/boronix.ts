import os from "node:os"
import path from "node:path"
import { loadConfig } from "../../config/load-config"
import type { ResolvedBoronixConfig } from "../../config/types"
import { createBoronixApp } from "../../core/app"
import { BoronixUserError } from "../../core/errors"
import { selectRuntime } from "../../runtime/select"
import { scanRoutes } from "../../scanner/scan-routes"
import { resolvePath } from "../../utils/path"
import { initUiSettings, areColorsEnabled, getNetworkAddress, openBrowser } from "../ui/terminal"
import { colors } from "../ui/colors"
import { symbols } from "../ui/symbols"
import { startSpinner, updateSpinner, stopSpinner } from "../ui/spinner"
import { formatRoutesSummary, getActionNames, getApiMethods, type CliRouteEntry } from "../ui/table"
import { typegenCommand } from "./typegen"

import { setBoronixMode } from "../../core/mode"

export async function devCommand(
  root: string,
  options: {
    runtime?: ResolvedBoronixConfig["runtime"] | undefined
    port?: number | undefined
    host?: string | undefined
    plain?: boolean | undefined
    noColor?: boolean | undefined
    open?: boolean | undefined
    quiet?: boolean | undefined
    verbose?: boolean | undefined
  } = {}
): Promise<void> {
  setBoronixMode("development")
  initUiSettings({ plain: options.plain, noColor: options.noColor })

  // Run typegen first
  try {
    await typegenCommand(root, { plain: options.plain, noColor: options.noColor })
  } catch {}

  const startTime = performance.now()
  startSpinner("loading config")
  
  const config = await loadConfig(root)
  if (options.runtime) config.runtime = options.runtime
  if (options.port !== undefined) config.server.port = options.port
  if (options.host !== undefined) config.server.host = options.host

  initUiSettings({ plain: options.plain, noColor: options.noColor }, config.cli)

  updateSpinner("scanning routes")
  const routesDir = resolvePath(root, config.app.routesDir)
  const manifest = scanRoutes(routesDir)
  if (manifest.length === 0) {
    stopSpinner(true)
    throw new BoronixUserError("No routes found.", {
      code: "KQ_ROUTES_MISSING",
      file: config.app.routesDir,
      hint: "Create at least one route capsule like app/routes/home/page.html."
    })
  }

  updateSpinner("starting server")
  const app = createBoronixApp({
    root,
    config,
    manifest,
    dev: true,
    quiet: options.quiet,
    verbose: options.verbose,
    plain: options.plain
  })
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
  const homedir = os.homedir()
  const displayRoot = root.startsWith(homedir) ? root.replace(homedir, "~") : root

  const localHost = config.server.host === "0.0.0.0" ? "localhost" : config.server.host
  const localUrl = `http://${localHost}:${config.server.port}`
  let networkUrl: string | undefined = undefined
  if (config.server.host === "0.0.0.0") {
    const netAddr = getNetworkAddress()
    if (netAddr) {
      networkUrl = `http://${netAddr}:${config.server.port}`
    }
  }

  if (isPlain) {
    console.log(`* Boronix`)
    console.log("")
    console.log(`  mode      dev`)
    console.log(`  runtime   ${config.runtime}`)
    console.log(`  local     ${localUrl}`)
    if (networkUrl) {
      console.log(`  network   ${networkUrl}`)
    }
    console.log(`  root      ${displayRoot}`)
    console.log("")
  } else {
    console.log(`${colors.brand(symbols.header())} ${colors.bold("Boronix")}`)
    console.log("")
    console.log(`  ${colors.success(symbols.success())} ${colors.muted("mode").padEnd(9)} ${colors.bold("dev")}`)
    console.log(`  ${colors.success(symbols.success())} ${colors.muted("runtime").padEnd(9)} ${colors.bold(config.runtime)}`)
    console.log(`  ${colors.brand(symbols.redirect())} ${colors.muted("local").padEnd(9)} ${colors.bold(localUrl)}`)
    if (networkUrl) {
      console.log(`  ${colors.brand(symbols.redirect())} ${colors.muted("network").padEnd(9)} ${colors.bold(networkUrl)}`)
    }
    console.log(`  ${colors.bold(symbols.home())} ${colors.muted("root").padEnd(9)} ${colors.bold(displayRoot)}`)
    console.log("")
  }

  if (options.verbose) {
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
  }

  const duration = Math.round(performance.now() - startTime)
  if (isPlain) {
    console.log(`ready, serving HTML in ${duration}ms`)
  } else {
    console.log(`${colors.success(symbols.success())} ${colors.bold("ready")}, serving HTML in ${colors.bold(`${duration}ms`)}`)
  }

  if (options.open) {
    openBrowser(localUrl).then((success) => {
      if (!success) {
        console.log(`${colors.warning(symbols.warning())} could not open browser`)
      }
    })
  }
}
