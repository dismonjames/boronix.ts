import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { execSync } from "node:child_process"
import { loadConfig } from "../../config/load-config"
import { scanRoutes } from "../../scanner/scan-routes"
import { resolvePath } from "../../utils/path"
import { initUiSettings, areColorsEnabled } from "../ui/terminal"
import { colors } from "../ui/colors"
import { symbols } from "../ui/symbols"
import { formatHeader } from "../ui/format"

type CheckResult = {
  label: string
  status: "success" | "warning" | "error"
  hint?: string | undefined
}

export async function doctorCommand(
  root: string,
  options: {
    plain?: boolean | undefined
    noColor?: boolean | undefined
  } = {}
): Promise<void> {
  initUiSettings({ plain: options.plain, noColor: options.noColor })

  const isPlain = !areColorsEnabled()
  let config: any = null
  let configLoadError: any = null

  try {
    config = await loadConfig(root)
  } catch (err: any) {
    configLoadError = err
  }

  // Categories
  const projectChecks: CheckResult[] = []
  const routesChecks: CheckResult[] = []
  const runtimeChecks: CheckResult[] = []

  // --- Category: project ---
  // 1. package.json found
  const pkgExists = existsSync(path.join(root, "package.json"))
  projectChecks.push({
    label: pkgExists ? "package.json found" : "package.json missing",
    status: pkgExists ? "success" : "error",
    hint: !pkgExists ? "Create a `package.json` file in the project root." : undefined
  })

  // 2. kumquat.config.ts found
  const configExists = existsSync(path.join(root, "kumquat.config.ts"))
  projectChecks.push({
    label: configExists ? "kumquat.config.ts found" : "kumquat.config.ts missing",
    status: configExists ? "success" : "error",
    hint: !configExists ? "Create a `kumquat.config.ts` configuration file." : undefined
  })

  // 3. app/routes found
  const routesDir = config ? resolvePath(root, config.app.routesDir) : path.join(root, "app/routes")
  const routesDirExists = existsSync(routesDir)
  projectChecks.push({
    label: routesDirExists ? "app/routes found" : "app/routes missing",
    status: routesDirExists ? "success" : "error",
    hint: !routesDirExists ? "Create `app/routes/home/page.html`." : undefined
  })

  // 4. public/ found
  const publicDir = config ? resolvePath(root, config.app.publicDir) : path.join(root, "public")
  const publicExists = existsSync(publicDir)
  projectChecks.push({
    label: publicExists ? "public/ found" : "public/ missing",
    status: publicExists ? "success" : "warning",
    hint: !publicExists ? "Create a `public` folder for static assets (optional)." : undefined
  })

  // --- Category: routes ---
  let duplicateRoutesFound = false
  let invalidCapsuleFound = false
  let capsuleErrors: string[] = []

  if (routesDirExists) {
    try {
      const routes = scanRoutes(routesDir)
      
      // Check duplicate routes
      const pagePaths = new Set<string>()
      const apiPaths = new Set<string>()
      for (const item of routes) {
        if (item.kind === "page") {
          if (pagePaths.has(item.routePath)) {
            duplicateRoutesFound = true
            capsuleErrors.push(`Duplicate page route found at path: ${item.routePath}`)
          }
          pagePaths.add(item.routePath)
        } else if (item.kind === "api") {
          const apiPath = item.apiPath ?? item.routePath
          if (apiPaths.has(apiPath)) {
            duplicateRoutesFound = true
            capsuleErrors.push(`Duplicate API route found at path: ${apiPath}`)
          }
          apiPaths.add(apiPath)
        }
      }

      // Check route capsules validity
      for (const item of routes) {
        if (item.pageModule && existsSync(item.pageModule)) {
          const content = readFileSync(item.pageModule, "utf8")
          if (!content.includes("export default")) {
            invalidCapsuleFound = true
            capsuleErrors.push(`Invalid page export in ${path.relative(root, item.pageModule)}. Expected \`export default page(...)\``)
          }
        }
        if (item.actionsModule && existsSync(item.actionsModule)) {
          const content = readFileSync(item.actionsModule, "utf8")
          if (content.includes("export default")) {
            invalidCapsuleFound = true
            capsuleErrors.push(`Invalid default export in actions module ${path.relative(root, item.actionsModule)}. Actions must be named exports.`)
          }
        }
      }
    } catch (err: any) {
      invalidCapsuleFound = true
      capsuleErrors.push(err.message)
    }
  }

  routesChecks.push({
    label: "no duplicate routes",
    status: duplicateRoutesFound ? "error" : "success",
    hint: duplicateRoutesFound ? capsuleErrors.filter(e => e.includes("Duplicate")).join("\n  ") : undefined
  })

  routesChecks.push({
    label: "route capsules valid",
    status: invalidCapsuleFound ? "error" : "success",
    hint: invalidCapsuleFound ? capsuleErrors.filter(e => !e.includes("Duplicate")).join("\n  ") : undefined
  })

  // --- Category: runtime ---
  const bunAvailable = hasBinary("bun")
  runtimeChecks.push({
    label: "bun available",
    status: bunAvailable ? "success" : "warning",
    hint: !bunAvailable ? "Install Bun runtime for maximum performance." : undefined
  })

  const nodeAvailable = hasBinary("node")
  runtimeChecks.push({
    label: "node available",
    status: nodeAvailable ? "success" : "warning",
    hint: !nodeAvailable ? "Install Node.js runtime fallback." : undefined
  })

  // Check config runtime validity if loaded
  if (config) {
    const validRuntimes = ["bun", "node", "deno"]
    const runtimeValid = validRuntimes.includes(config.runtime)
    runtimeChecks.push({
      label: `runtime config valid (${config.runtime})`,
      status: runtimeValid ? "success" : "error",
      hint: !runtimeValid ? `Runtime '${config.runtime}' is not supported. Use 'bun' or 'node'.` : undefined
    })

    // Session secret warning in production
    const isProduction = process.env.NODE_ENV === "production"
    const isSecretDefault = config.session.secret === "kumquat-dev-session-secret"
    if (isProduction && isSecretDefault) {
      runtimeChecks.push({
        label: "session secret secure",
        status: "error",
        hint: "In production, session.secret must not use the development default value. Set SESSION_SECRET env variable."
      })
    }
  } else if (configLoadError) {
    runtimeChecks.push({
      label: "kumquat.config.ts valid",
      status: "error",
      hint: `Config loading failed: ${configLoadError.message}`
    })
  }

  // Print results
  if (isPlain) {
    console.log(`* Kumquat doctor`)
  } else {
    console.log(`${colors.brand(symbols.header())} ${colors.bold("Kumquat doctor")}`)
  }
  console.log("")

  let errorsCount = 0
  let warningsCount = 0
  const hints: string[] = []

  function printCategory(name: string, checks: CheckResult[]) {
    if (isPlain) {
      console.log(`  ${name}`)
    } else {
      console.log(`  ${colors.bold(name)}`)
    }

    for (let i = 0; i < checks.length; i++) {
      const c = checks[i]!
      const isLast = i === checks.length - 1
      const branch = isLast ? symbols.lastBranch() : symbols.branch()

      let sym = ""
      if (c.status === "success") {
        sym = isPlain ? "✔" : colors.success(symbols.success())
      } else if (c.status === "warning") {
        sym = isPlain ? "⚠" : colors.warning(symbols.warning())
        warningsCount++
      } else {
        sym = isPlain ? "✖" : colors.error(symbols.error())
        errorsCount++
      }

      const branchColored = isPlain ? branch : colors.muted(branch)
      console.log(`  ${branchColored} ${sym} ${c.label}`)

      if (c.hint) {
        hints.push(c.hint)
      }
    }
    console.log("")
  }

  printCategory("project", projectChecks)
  printCategory("routes", routesChecks)
  printCategory("runtime", runtimeChecks)

  if (errorsCount > 0) {
    if (isPlain) {
      console.log(`✖ ${errorsCount} issue${errorsCount > 1 ? "s" : ""} found`)
    } else {
      console.log(`${colors.error(symbols.error())} ${colors.bold(`${errorsCount} issue${errorsCount > 1 ? "s" : ""} found`)}`)
    }
    console.log("")
    console.log(colors.bold("Hint:"))
    for (const h of hints) {
      console.log(`  ${h}`)
    }
    process.exit(1)
  } else {
    if (isPlain) {
      console.log(`✔ project looks healthy`)
    } else {
      console.log(`${colors.success(symbols.success())} ${colors.bold("project looks healthy")}`)
    }
    process.exit(0)
  }
}

function hasBinary(bin: string): boolean {
  try {
    execSync(`which ${bin}`, { stdio: "ignore" })
    return true
  } catch {
    return false
  }
}
