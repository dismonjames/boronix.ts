import { existsSync } from "node:fs"
import path from "node:path"
import { loadConfig } from "../../config/load-config"
import type { ResolvedKumquatConfig } from "../../config/types"
import { KumquatUserError } from "../../core/errors"
import { matchRoute } from "../../core/router"
import { scanRoutes } from "../../scanner/scan-routes"
import { resolvePath } from "../../utils/path"
import { initUiSettings, areColorsEnabled } from "../ui/terminal"
import { colors } from "../ui/colors"
import { symbols } from "../ui/symbols"

export async function inspectCommand(
  root: string,
  routePath: string,
  options: {
    plain?: boolean | undefined
    noColor?: boolean | undefined
  } = {}
): Promise<void> {
  initUiSettings({ plain: options.plain, noColor: options.noColor })

  const config = await loadConfig(root)
  initUiSettings({ plain: options.plain, noColor: options.noColor }, config.cli)

  const routesDir = resolvePath(root, config.app.routesDir)
  const manifest = scanRoutes(routesDir)

  const isPlain = !areColorsEnabled()

  // Match route
  let matched = matchRoute(manifest, routePath, "page")
  if (!matched) {
    matched = matchRoute(manifest, routePath, "api")
  }

  if (!matched) {
    throw new KumquatUserError(`No route matched \`${routePath}\`.`, {
      code: "KQ_ROUTE_NOT_FOUND",
      hint: "Run `kumquat routes` to see available routes."
    })
  }

  const item = matched.item
  const params = matched.params
  const paramKeys = Object.keys(params)

  // Resolve layouts
  const layouts: string[] = []
  const rawSource = item.pageHtml || item.pageModule || item.apiModule || ""
  if (rawSource) {
    let currentDir = path.dirname(resolvePath(root, rawSource))
    const routesDirAbs = resolvePath(root, config.app.routesDir)
    const appDirAbs = path.dirname(routesDirAbs)

    while (currentDir.startsWith(appDirAbs)) {
      const layoutPath = path.join(currentDir, "layout.html")
      if (existsSync(layoutPath)) {
        layouts.push(path.relative(root, layoutPath))
      }
      if (currentDir === appDirAbs) break
      currentDir = path.dirname(currentDir)
    }
  }

  // Print Header
  if (isPlain) {
    console.log(`* Kumquat inspect`)
  } else {
    console.log(`${colors.brand(symbols.header())} ${colors.bold("Kumquat inspect")}`)
  }
  console.log("")

  // Print URL header
  if (isPlain) {
    console.log(`  * ${routePath}`)
  } else {
    console.log(`  ${colors.brand(symbols.header())} ${colors.path(routePath)}`)
  }
  console.log(`  ${isPlain ? symbols.line() : colors.muted(symbols.line())}`)

  // 1. Matched Route Branch
  const hasParams = paramKeys.length > 0
  const matchedBranch = hasParams ? symbols.branch() : symbols.lastBranch()
  
  if (isPlain) {
    console.log(`  ${matchedBranch} matched`)
    console.log(`  ${hasParams ? symbols.line() : " "}  ${symbols.lastBranch()} ${item.routePath}`)
  } else {
    console.log(`  ${colors.muted(matchedBranch)} ${colors.bold("matched")}`)
    console.log(`  ${colors.muted(hasParams ? symbols.line() : " ")}  ${colors.muted(symbols.lastBranch())} ${colors.path(item.routePath)}`)
  }

  // 2. Params Branch (optional)
  if (hasParams) {
    if (isPlain) {
      console.log(`  ${symbols.line()}`)
      console.log(`  ${symbols.branch()} params`)
      for (let i = 0; i < paramKeys.length; i++) {
        const key = paramKeys[i]!
        const isLastParam = i === paramKeys.length - 1
        const paramBranch = isLastParam ? symbols.lastBranch() : symbols.branch()
        console.log(`  ${symbols.line()}  ${paramBranch} ${key}  ${params[key]}`)
      }
    } else {
      console.log(`  ${colors.muted(symbols.line())}`)
      console.log(`  ${colors.muted(symbols.branch())} ${colors.bold("params")}`)
      for (let i = 0; i < paramKeys.length; i++) {
        const key = paramKeys[i]!
        const isLastParam = i === paramKeys.length - 1
        const paramBranch = isLastParam ? symbols.lastBranch() : symbols.branch()
        console.log(`  ${colors.muted(symbols.line())}  ${colors.muted(paramBranch)} ${colors.brand(key.padEnd(5))} ${colors.path(String(params[key]))}`)
      }
    }
  }

  // 3. Files Branch
  if (isPlain) {
    console.log(`  ${symbols.line()}`)
    console.log(`  ${symbols.lastBranch()} files`)
  } else {
    console.log(`  ${colors.muted(symbols.line())}`)
    console.log(`  ${colors.muted(symbols.lastBranch())} ${colors.bold("files")}`)
  }

  const fileRows: { label: string; file: string }[] = []
  if (item.pageHtml) {
    fileRows.push({ label: "page", file: path.relative(root, item.pageHtml) })
  }
  if (item.pageModule) {
    fileRows.push({ label: "loader", file: path.relative(root, item.pageModule) })
  }
  if (item.actionsModule) {
    fileRows.push({ label: "actions", file: path.relative(root, item.actionsModule) })
  }
  if (item.apiModule) {
    fileRows.push({ label: "api", file: path.relative(root, item.apiModule) })
  }
  // Layouts in nested order
  for (let i = 0; i < layouts.length; i++) {
    const lay = layouts[i]!
    const isGlobal = i === layouts.length - 1
    fileRows.push({
      label: isGlobal ? "layout" : "layout (nested)",
      file: lay
    })
  }

  for (let i = 0; i < fileRows.length; i++) {
    const row = fileRows[i]!
    const isLastRow = i === fileRows.length - 1
    const fileBranch = isLastRow ? symbols.lastBranch() : symbols.branch()

    const labelStr = row.label.padEnd(8)
    if (isPlain) {
      console.log(`     ${fileBranch} ${labelStr} ${row.file}`)
    } else {
      console.log(`     ${colors.muted(fileBranch)} ${colors.muted(labelStr)} ${colors.path(row.file)}`)
    }
  }

  console.log("")
  if (isPlain) {
    console.log(`OK route resolved`)
  } else {
    console.log(`${colors.success(symbols.success())} ${colors.bold("route resolved")}`)
  }
}
