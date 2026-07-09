import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { loadConfig } from "../../config/load-config"
import type { ResolvedGorosConfig } from "../../config/types"
import { createGorosApp } from "../../core/app"
import { GorosUserError } from "../../core/errors"
import { selectRuntime } from "../../runtime/select"
import type { BuildManifest } from "../../build/manifest"
import { initUiSettings, areColorsEnabled } from "../ui/terminal"
import { colors } from "../ui/colors"
import { symbols } from "../ui/symbols"

export async function startCommand(
  root: string,
  options: {
    runtime?: ResolvedGorosConfig["runtime"] | undefined
    port?: number | undefined
    host?: string | undefined
    plain?: boolean | undefined
    noColor?: boolean | undefined
    quiet?: boolean | undefined
    verbose?: boolean | undefined
  } = {}
): Promise<void> {
  initUiSettings({ plain: options.plain, noColor: options.noColor })

  const manifestPath = path.join(root, ".goros", "manifest.json")

  if (!existsSync(manifestPath)) {
    const legacyPath = path.join(root, ".kumquat", "manifest.json")
    if (existsSync(legacyPath)) {
      throw new GorosUserError("Found old .kumquat build output.", {
        code: "KQ_MANIFEST_DEPRECATED",
        hint: "Run `goros build` to generate .goros."
      })
    }
    throw new GorosUserError("No production manifest found.", {
      code: "KQ_MANIFEST_MISSING",
      hint: "Run `goros build` before `goros start`."
    })
  }

  const config = await loadConfig(root)
  initUiSettings({ plain: options.plain, noColor: options.noColor }, config.cli)

  const runtimeName = options.runtime ?? config.runtime
  const port = options.port ?? config.server.port
  const host = options.host ?? config.server.host

  const runtime = selectRuntime(runtimeName)
  const buildManifest = JSON.parse(readFileSync(manifestPath, "utf8")) as BuildManifest
  const app = createGorosApp({
    root,
    config,
    manifest: buildManifest.routes,
    quiet: options.quiet,
    verbose: options.verbose,
    plain: options.plain
  })

  try {
    runtime.serve({
      port,
      host,
      fetch: app.fetch
    })
  } catch (err: any) {
    throw err
  }

  const isPlain = !areColorsEnabled()
  const localHost = host === "0.0.0.0" ? "localhost" : host
  const localUrl = `http://${localHost}:${port}`

  if (isPlain) {
    console.log(`* Goros`)
    console.log("")
    console.log(`  mode      start`)
    console.log(`  runtime   ${runtimeName}`)
    console.log(`  manifest  .goros/manifest.json`)
    console.log(`  local     ${localUrl}`)
    console.log("")
    console.log(`server started`)
  } else {
    console.log(`${colors.brand(symbols.header())} ${colors.bold("Goros")}`)
    console.log("")
    console.log(`  ${colors.success(symbols.success())} ${colors.muted("mode").padEnd(9)} ${colors.bold("start")}`)
    console.log(`  ${colors.success(symbols.success())} ${colors.muted("runtime").padEnd(9)} ${colors.bold(runtimeName)}`)
    console.log(`  ${colors.brand(symbols.output())} ${colors.muted("manifest").padEnd(9)} ${colors.bold(".goros/manifest.json")}`)
    console.log(`  ${colors.brand(symbols.redirect())} ${colors.muted("local").padEnd(9)} ${colors.bold(localUrl)}`)
    console.log("")
    console.log(`${colors.success(symbols.success())} ${colors.bold("server started")}`)
  }
}
