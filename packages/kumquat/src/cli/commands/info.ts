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

import { symbols } from "../ui/symbols"

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

  if (isPlain) {
    console.log(`* Kumquat info`)
  } else {
    console.log(`${colors.brand(symbols.header())} ${colors.bold("Kumquat info")}`)
  }
  console.log("")

  function printInfoGroup(title: string, items: { label: string; value: string }[]) {
    if (isPlain) {
      console.log(`  ${title}`)
    } else {
      console.log(`  ${colors.bold(title)}`)
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i]!
      const isLast = i === items.length - 1
      const branch = isLast ? symbols.lastBranch() : symbols.branch()
      
      let sym = ""
      if (title === "project") {
        if (item.label === "pages") {
          sym = isPlain ? "○" : colors.success(symbols.page())
        } else {
          sym = isPlain ? "ƒ" : colors.brand(symbols.fn())
        }
      } else {
        if (item.label === "root") {
          sym = isPlain ? "root" : colors.bold(symbols.home())
        } else {
          sym = isPlain ? "✔" : colors.success(symbols.success())
        }
      }

      const branchColored = isPlain ? branch : colors.muted(branch)
      const labelText = item.label.padEnd(8)
      const labelColored = isPlain ? labelText : colors.muted(labelText)
      const valColored = isPlain ? item.value : colors.bold(item.value)

      console.log(`  ${branchColored} ${sym} ${labelColored} ${valColored}`)
    }
    console.log("")
  }

  printInfoGroup("system", [
    { label: "os", value: osName },
    { label: "shell", value: shell },
    { label: "cpu", value: cpuModel },
    { label: "memory", value: totalMemGB }
  ])

  printInfoGroup("binaries", [
    { label: "bun", value: bunVersion },
    { label: "node", value: nodeVersion }
  ])

  printInfoGroup("kumquat", [
    { label: "version", value: version },
    { label: "runtime", value: runtime },
    { label: "root", value: displayRoot }
  ])

  printInfoGroup("project", [
    { label: "pages", value: String(pagesCount) },
    { label: "apis", value: String(apisCount) },
    { label: "actions", value: String(actionsCount) }
  ])
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
