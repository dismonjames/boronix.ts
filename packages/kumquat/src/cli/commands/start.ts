import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { loadConfig } from "../../config/load-config"
import type { ResolvedKumquatConfig } from "../../config/types"
import { createKumquatApp } from "../../core/app"
import { KumquatUserError } from "../../core/errors"
import { selectRuntime } from "../../runtime/select"
import type { BuildManifest } from "../../build/manifest"
import { initUiSettings, areColorsEnabled } from "../ui/terminal"
import { colors } from "../ui/colors"
import { symbols } from "../ui/symbols"
import { formatHeader } from "../ui/format"

export async function startCommand(
  root: string,
  options: {
    runtime?: ResolvedKumquatConfig["runtime"] | undefined
    port?: number | undefined
    host?: string | undefined
    plain?: boolean | undefined
    noColor?: boolean | undefined
  } = {}
): Promise<void> {
  initUiSettings({ plain: options.plain, noColor: options.noColor })

  const manifestPath = path.join(root, ".kumquat", "manifest.json")

  if (!existsSync(manifestPath)) {
    throw new KumquatUserError("No production manifest found.", {
      code: "KQ_MANIFEST_MISSING",
      hint: "Run `kumquat build` before `kumquat start`."
    })
  }

  const config = await loadConfig(root)
  const runtimeName = options.runtime ?? config.runtime
  const port = options.port ?? config.server.port
  const host = options.host ?? config.server.host

  const runtime = selectRuntime(runtimeName)
  const buildManifest = JSON.parse(readFileSync(manifestPath, "utf8")) as BuildManifest
  const app = createKumquatApp({ root, config, manifest: buildManifest.routes })

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
  console.log(formatHeader("start", isPlain))
  console.log("")

  if (isPlain) {
    console.log(`runtime: ${runtimeName}`)
    console.log(`manifest: .kumquat/manifest.json`)
    console.log(`local: http://${host === "0.0.0.0" ? "localhost" : host}:${port}`)
    console.log("")
    console.log("server started")
  } else {
    console.log(`  ${colors.muted("runtime")}   ${colors.bold(runtimeName)}`)
    console.log(`  ${colors.muted("manifest")}  ${colors.bold(".kumquat/manifest.json")}`)
    console.log(`  ${colors.muted("local")}     ${colors.bold(`http://${host === "0.0.0.0" ? "localhost" : host}:${port}`)}`)
    console.log("")
    console.log(`${colors.success(symbols.success())} ${colors.bold("server started")}`)
  }
}
