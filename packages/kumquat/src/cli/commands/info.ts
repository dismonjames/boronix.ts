import os from "node:os"
import path from "node:path"
import { existsSync, readFileSync } from "node:fs"
import { execSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import { loadConfig } from "../../config/load-config"
import { scanRoutes } from "../../scanner/scan-routes"
import { resolvePath } from "../../utils/path"
import { initUiSettings, areColorsEnabled } from "../ui/terminal"
import { colors } from "../ui/colors"
import { formatHeader } from "../ui/format"
import { getActionNames } from "../ui/table"

export async function infoCommand(
  root: string,
  options: {
    plain?: boolean | undefined
    noColor?: boolean | undefined
  } = {}
): Promise<void> {
  initUiSettings({ plain: options.plain, noColor: options.noColor })

  const isPlain = !areColorsEnabled()

  // 1. Gather System Info
  const platform = os.platform()
  const arch = os.arch()
  const osName = `${platform} ${arch}`
  
  const shell = process.env.SHELL ? path.basename(process.env.SHELL) : "unknown"
  
  const cpus = os.cpus()
  const firstCpu = cpus[0]
  const cpuModel = firstCpu
    ? firstCpu.model.replace(/\(R\)|\(TM\)/g, "").trim()
    : "unknown"
    
  const totalMemGB = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(1) + " GB"

  // 2. Gather Binary Info
  const bunVersion = process.versions.bun ?? getBinaryVersion("bun")
  const nodeVersion = process.versions.node ?? getBinaryVersion("node")

  // 3. Gather Kumquat Info
  const version = getKumquatVersion()
  const config = await loadConfig(root)
  const runtime = config.runtime

  // 4. Gather Project Info
  let pagesCount = 0
  let apisCount = 0
  let actionsCount = 0

  const routesDir = resolvePath(root, config.app.routesDir)
  if (existsSync(routesDir)) {
    const routes = scanRoutes(routesDir)
    for (const item of routes) {
      if (item.kind === "page") {
        pagesCount++
        if (item.actionsModule) {
          actionsCount += getActionNames(item.actionsModule).length
        }
      } else if (item.kind === "api") {
        apisCount++
      }
    }
  }

  const homedir = os.homedir()
  const displayRoot = root.startsWith(homedir) ? root.replace(homedir, "~") : root

  console.log(formatHeader("info", isPlain))
  console.log("")

  if (isPlain) {
    console.log("system")
    console.log(`os       ${osName}`)
    console.log(`shell    ${shell}`)
    console.log(`cpu      ${cpuModel}`)
    console.log(`memory   ${totalMemGB}`)
    console.log("")
    console.log("binaries")
    console.log(`bun      ${bunVersion}`)
    console.log(`node     ${nodeVersion}`)
    console.log("")
    console.log("kumquat")
    console.log(`version  ${version}`)
    console.log(`runtime  ${runtime}`)
    console.log(`root     ${root}`)
    console.log("")
    console.log("project")
    console.log(`pages    ${pagesCount}`)
    console.log(`apis     ${apisCount}`)
    console.log(`actions  ${actionsCount}`)
  } else {
    console.log(`  ${colors.bold("system")}`)
    console.log(`  os       ${osName}`)
    console.log(`  shell    ${shell}`)
    console.log(`  cpu      ${cpuModel}`)
    console.log(`  memory   ${totalMemGB}`)
    console.log("")
    console.log(`  ${colors.bold("binaries")}`)
    console.log(`  bun      ${bunVersion}`)
    console.log(`  node     ${nodeVersion}`)
    console.log("")
    console.log(`  ${colors.bold("kumquat")}`)
    console.log(`  version  ${version}`)
    console.log(`  runtime  ${runtime}`)
    console.log(`  root     ${displayRoot}`)
    console.log("")
    console.log(`  ${colors.bold("project")}`)
    console.log(`  pages    ${pagesCount}`)
    console.log(`  apis     ${apisCount}`)
    console.log(`  actions  ${actionsCount}`)
  }
}

function getBinaryVersion(bin: string): string {
  try {
    const out = execSync(`${bin} --version`, { stdio: ["ignore", "pipe", "ignore"] })
    return out.toString().trim().replace(/^v/, "")
  } catch {
    return "unknown"
  }
}

function getKumquatVersion(): string {
  try {
    const cliDir = path.dirname(fileURLToPath(import.meta.url))
    let dir = cliDir
    while (dir && dir !== path.dirname(dir)) {
      const pkgPath = path.join(dir, "package.json")
      if (existsSync(pkgPath)) {
        const pkg = JSON.parse(readFileSync(pkgPath, "utf8"))
        if (pkg.name === "kumquat") {
          return pkg.version
        }
      }
      dir = path.dirname(dir)
    }
  } catch {}
  return "0.2.2" // fallback
}
