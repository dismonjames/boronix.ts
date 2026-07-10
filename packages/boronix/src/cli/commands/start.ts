import { existsSync } from "node:fs"
import path from "node:path"
import { loadConfig } from "../../config/load-config"
import type { ResolvedBoronixConfig } from "../../config/types"
import { createBoronixApp } from "../../core/app"
import { BoronixUserError } from "../../core/errors"
import { selectRuntime } from "../../runtime/select"
import { readBuildManifest, validateBuildManifest } from "../../build/manifest"
import { validateProductionConfig } from "../../config/validation"
import { setBoronixMode } from "../../core/mode"
import { initUiSettings, areColorsEnabled } from "../ui/terminal"
import { colors } from "../ui/colors"
import { symbols } from "../ui/symbols"

export async function startCommand(
  root: string,
  options: {
    runtime?: ResolvedBoronixConfig["runtime"] | undefined
    port?: number | undefined
    host?: string | undefined
    plain?: boolean | undefined
    noColor?: boolean | undefined
    quiet?: boolean | undefined
    verbose?: boolean | undefined
  } = {}
): Promise<void> {
  // 1. Set production mode
  setBoronixMode("production")

  initUiSettings({ plain: options.plain, noColor: options.noColor })

  const resolvedRoot = path.resolve(root)

  // 2. Read and validate build manifest
  const manifest = readBuildManifest(resolvedRoot)

  const runtimeName = options.runtime ?? manifest.runtime ?? "node"

  if (runtimeName === "deno") {
    throw new BoronixUserError("Deno runtime is not implemented yet.", {
      code: "KQ_RUNTIME_UNSUPPORTED",
      hint: "Use `--runtime bun` or `--runtime node`."
    })
  }

  // validateBuildManifest throws KQ_BUILD_RUNTIME_MISMATCH if runtime does not match
  validateBuildManifest(manifest, runtimeName as "bun" | "node", resolvedRoot)

  // 3. Resolve port and host priority: CLI flags -> config -> environment variables -> defaults
  // Import the compiled production entry.js first so global config and modules are loaded
  const entryPath = path.resolve(resolvedRoot, manifest.output.serverEntry || ".boronix/server/entry.js")
  const { pathToFileURL } = await import("node:url")
  await import(pathToFileURL(entryPath).href)

  const config = await loadConfig(resolvedRoot)

  const hasConfig = existsSync(path.join(resolvedRoot, "boronix.config.ts"))
  const resolvedHost = options.host ?? (hasConfig ? config.server.host : undefined) ?? process.env.BORONIX_HOST ?? process.env.HOST ?? "0.0.0.0"
  const envPort = process.env.BORONIX_PORT ?? process.env.PORT
  const resolvedPort = options.port ?? (hasConfig ? config.server.port : undefined) ?? (envPort ? parseInt(envPort, 10) : undefined) ?? 3000

  config.server.host = resolvedHost
  config.server.port = resolvedPort

  // 4. Validate production environment config (port, host, session secret, paths)
  validateProductionConfig(resolvedRoot, config, runtimeName)

  initUiSettings({ plain: options.plain, noColor: options.noColor }, config.cli)

  // Resolve relative routes to absolute paths
  const absoluteRoutes = manifest.routes.map((route: any) => {
    const copy = { ...route }
    if (copy.routeDir) copy.routeDir = path.resolve(resolvedRoot, copy.routeDir)
    if (copy.pageHtml) copy.pageHtml = path.resolve(resolvedRoot, copy.pageHtml)
    if (copy.pageModule) copy.pageModule = path.resolve(resolvedRoot, copy.pageModule)
    if (copy.apiModule) copy.apiModule = path.resolve(resolvedRoot, copy.apiModule)
    if (copy.actionsModule) copy.actionsModule = path.resolve(resolvedRoot, copy.actionsModule)
    return copy
  })

  // 5. Create production app
  const app = createBoronixApp({
    root: resolvedRoot,
    config,
    manifest: absoluteRoutes,
    quiet: options.quiet,
    verbose: options.verbose,
    plain: options.plain
  })

  const runtime = selectRuntime(runtimeName)
  let server: any
  try {
    server = runtime.serve({
      port: resolvedPort,
      host: resolvedHost,
      fetch: app.fetch
    })
  } catch (err: any) {
    throw err
  }

  // Graceful shutdown handling
  let isShuttingDown = false
  const shutdown = () => {
    if (isShuttingDown) return
    isShuttingDown = true

    console.log("")
    console.warn("⚠ shutdown requested")

    try {
      if (server && typeof server.stop === "function") {
        // Bun
        server.stop()
      } else if (server && typeof server.close === "function") {
        // Node HTTP
        server.close()
      }
    } catch {}

    const forceTimeout = setTimeout(() => {
      console.log("✔ server stopped")
      process.exit(0)
    }, 5000)

    if (server && typeof server.close === "function") {
      server.close(() => {
        clearTimeout(forceTimeout)
        console.log("✔ server stopped")
        process.exit(0)
      })
    } else {
      setTimeout(() => {
        clearTimeout(forceTimeout)
        console.log("✔ server stopped")
        process.exit(0)
      }, 100)
    }
  }

  process.on("SIGINT", shutdown)
  process.on("SIGTERM", shutdown)

  const isPlain = !areColorsEnabled()
  const localHost = resolvedHost === "0.0.0.0" ? "localhost" : resolvedHost
  const localUrl = `http://${localHost}:${resolvedPort}`

  if (isPlain) {
    console.log(`* Boronix`)
    console.log("")
    console.log(`  mode      start`)
    console.log(`  runtime   ${runtimeName}`)
    console.log(`  manifest  .boronix/manifest.json`)
    console.log(`  local     ${localUrl}`)
    console.log("")
    console.log(`server started`)
  } else {
    console.log(`${colors.brand(symbols.header())} ${colors.bold("Boronix")}`)
    console.log("")
    console.log(`  ${colors.success(symbols.success())} ${colors.muted("mode").padEnd(9)} ${colors.bold("start")}`)
    console.log(`  ${colors.success(symbols.success())} ${colors.muted("runtime").padEnd(9)} ${colors.bold(runtimeName)}`)
    console.log(`  ${colors.brand(symbols.output())} ${colors.muted("manifest").padEnd(9)} ${colors.bold(".boronix/manifest.json")}`)
    console.log(`  ${colors.brand(symbols.redirect())} ${colors.muted("local").padEnd(9)} ${colors.bold(localUrl)}`)
    console.log("")
    console.log(`${colors.success(symbols.success())} ${colors.bold("server started")}`)
  }
}
