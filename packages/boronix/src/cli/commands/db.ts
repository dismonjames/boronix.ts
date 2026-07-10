import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { execFileSync } from "node:child_process"
import { createRequire } from "node:module"
import { BoronixUserError } from "../../core/errors"
import { initUiSettings, areColorsEnabled } from "../ui/terminal"
import { colors } from "../ui/colors"
import { symbols } from "../ui/symbols"

export type DbSubcommand = "generate" | "migrate" | "push" | "seed"

export async function dbCommand(
  root: string,
  command: string | undefined,
  options: {
    plain?: boolean | undefined
    noColor?: boolean | undefined
  } = {}
): Promise<void> {
  initUiSettings({ plain: options.plain, noColor: options.noColor })

  if (!isDbSubcommand(command)) {
    throw new BoronixUserError("Unknown database command.", {
      code: "KQ_DB_COMMAND_FAILED",
      hint: "Usage:\n  boronix db generate\n  boronix db migrate\n  boronix db push\n  boronix db seed"
    })
  }

  const configPath = path.join(root, "drizzle.config.ts")
  if (!existsSync(configPath)) {
    throw new BoronixUserError("Could not find drizzle.config.ts.", {
      code: "KQ_DB_CONFIG_NOT_FOUND",
      hint: "Run create-boronix with --db sqlite or --db postgres."
    })
  }

  printHeader(command, root)

  if (command === "seed") {
    runSeed(root)
    printSuccess("database seed completed")
    return
  }

  const drizzleKit = resolveDrizzleKit(root)
  runDrizzleKit(root, drizzleKit, command)
  printSuccess(command === "push" ? "database schema pushed" : `database ${command} completed`)
}

function isDbSubcommand(value: string | undefined): value is DbSubcommand {
  return value === "generate" || value === "migrate" || value === "push" || value === "seed"
}

function resolveDrizzleKit(root: string): string {
  const pkgPath = path.join(root, "package.json")
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"))
    const hasDependency = Boolean(pkg.devDependencies?.["drizzle-kit"] ?? pkg.dependencies?.["drizzle-kit"])
    if (hasDependency) {
      let currentDir = root
      while (true) {
        const localBin = path.join(currentDir, "node_modules", ".bin", process.platform === "win32" ? "drizzle-kit.cmd" : "drizzle-kit")
        if (existsSync(localBin)) {
          return localBin
        }
        const parent = path.dirname(currentDir)
        if (parent === currentDir) break
        currentDir = parent
      }
    }
  }

  throw new BoronixUserError("drizzle-kit is not installed in this project.", {
    code: "KQ_DB_KIT_NOT_FOUND",
    hint: "Install it or recreate the app with --db sqlite/postgres."
  })
}

function runDrizzleKit(root: string, drizzleKit: string, command: DbSubcommand): void {
  try {
    execFileSync(drizzleKit, [command], { cwd: root, stdio: "inherit", env: process.env })
  } catch (cause) {
    throw new BoronixUserError(`Database command failed: ${command}`, {
      code: "KQ_DB_COMMAND_FAILED",
      hint: "Check the Drizzle Kit output above for details.",
      cause
    })
  }
}

function runSeed(root: string): void {
  const seedPath = path.join(root, "app", "db", "seed.ts")
  if (!existsSync(seedPath)) {
    throw new BoronixUserError("Could not find app/db/seed.ts.", {
      code: "KQ_DB_SEED_NOT_FOUND"
    })
  }

  try {
    if (typeof globalThis.Bun !== "undefined") {
      execFileSync("bun", [seedPath], { cwd: root, stdio: "inherit", env: process.env })
    } else {
      const require = createRequire(import.meta.url)
      let tsxLoader: string
      try {
        tsxLoader = import.meta.resolve("tsx")
      } catch {
        tsxLoader = require.resolve("tsx")
      }
      execFileSync("node", ["--import", tsxLoader, seedPath], { cwd: root, stdio: "inherit", env: process.env })
    }
  } catch (cause) {
    throw new BoronixUserError("Database seed failed.", {
      code: "KQ_DB_COMMAND_FAILED",
      hint: "Check app/db/seed.ts and database connection settings.",
      cause
    })
  }
}

function printHeader(command: DbSubcommand, root: string): void {
  const isPlain = !areColorsEnabled()
  if (isPlain) {
    console.log("* Boronix DB")
  } else {
    console.log(`${colors.brand(symbols.header())} ${colors.bold("Boronix DB")}`)
  }
  console.log("")
  console.log(`  ${successSymbol(isPlain)} command   ${command}`)
  console.log(`  ${successSymbol(isPlain)} config    drizzle.config.ts`)
  console.log(`  ${symbols.home()} root      ${shortenHome(root)}`)
  console.log("")
}

function printSuccess(message: string): void {
  const isPlain = !areColorsEnabled()
  console.log("")
  console.log(`${successSymbol(isPlain)} ${colors.bold(message)}`)
}

function successSymbol(isPlain: boolean): string {
  return isPlain ? "✔" : colors.success(symbols.success())
}

function shortenHome(value: string): string {
  const home = process.env.HOME
  if (home && value.startsWith(home)) {
    return value.replace(home, "~")
  }
  return value
}
