import { existsSync, mkdirSync, rmSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { execSync } from "node:child_process"
import os from "node:os"

console.log("Running smoke pack test...")

const rootDir = path.resolve(".")
const boronixTar = path.join(rootDir, "packages/boronix/boronix-0.3.0.tgz")
const createTar = path.join(rootDir, "packages/create-boronix/create-boronix-0.3.0.tgz")

// Clean old tarballs if exist
if (existsSync(boronixTar)) rmSync(boronixTar)
if (existsSync(createTar)) rmSync(createTar)

// Pack packages
console.log("Packing packages...")
execSync("cd packages/boronix && bun pm pack", { stdio: "inherit" })
execSync("cd packages/create-boronix && bun pm pack", { stdio: "inherit" })

if (!existsSync(boronixTar) || !existsSync(createTar)) {
  console.error("✖ Packing failed")
  process.exit(1)
}

const tempDir = path.join(os.tmpdir(), `boronix-smoke-${Date.now()}`)
mkdirSync(tempDir, { recursive: true })

try {
  // Test create-boronix non-interactive scaffolding using the built script
  console.log("Testing create-boronix non-interactive...")
  execSync(`bun ${rootDir}/packages/create-boronix/dist/index.js my-app --template basic --runtime bun --no-install --no-git`, {
    cwd: tempDir,
    stdio: "inherit"
  })

  const appPath = path.join(tempDir, "my-app")
  const scaffoldedPkgPath = path.join(appPath, "package.json")
  if (!existsSync(scaffoldedPkgPath)) {
    console.error("✖ Scaffolding package.json missing")
    process.exit(1)
  }
  if (!existsSync(path.join(appPath, "boronix.config.ts"))) {
    console.error("✖ Scaffolding boronix.config.ts missing")
    process.exit(1)
  }

  // Pre-clean template placeholder dependency to avoid registry resolve errors before local install
  const pkg = JSON.parse(readFileSync(scaffoldedPkgPath, "utf8"))
  if (pkg.dependencies && pkg.dependencies.boronix) {
    delete pkg.dependencies.boronix
  }
  writeFileSync(scaffoldedPkgPath, JSON.stringify(pkg, null, 2), "utf8")

  // Update dependencies in the scaffolded app to point to the local boronix tarball
  console.log("Installing local boronix tarball in scaffolded app...")
  execSync(`bun add ${boronixTar}`, { cwd: appPath, stdio: "inherit" })

  // Run doctor
  console.log("Running bunx boronix doctor...")
  execSync("bunx boronix doctor", { cwd: appPath, stdio: "inherit" })

  // Run typegen
  console.log("Running bunx boronix typegen...")
  execSync("bunx boronix typegen", { cwd: appPath, stdio: "inherit" })

  // Verify .boronix/types/routes.d.ts exists
  const typegenFile = path.join(appPath, ".boronix", "types", "routes.d.ts")
  if (!existsSync(typegenFile)) {
    console.error("✖ Typegen routes.d.ts file missing")
    process.exit(1)
  }
  console.log("✔ Typegen routes.d.ts verified")

  // Run build
  console.log("Running bunx boronix build...")
  execSync("bunx boronix build", { cwd: appPath, stdio: "inherit" })

  // Verify .boronix/manifest.json exists
  const manifestFile = path.join(appPath, ".boronix", "manifest.json")
  if (!existsSync(manifestFile)) {
    console.error("✖ Production manifest .boronix/manifest.json missing after build")
    process.exit(1)
  }

  // Run routes --json
  console.log("Running bunx boronix routes --json...")
  const routesJson = execSync("bunx boronix routes --json", { cwd: appPath }).toString()
  const parsed = JSON.parse(routesJson)
  if (!Array.isArray(parsed) || parsed.length === 0) {
    console.error("✖ Invalid routes JSON output:", routesJson)
    process.exit(1)
  }
  console.log("✔ Routes parsed successfully:", parsed.length, "routes found")

  // Run inspect / --json
  console.log("Running bunx boronix inspect / --json...")
  const inspectJson = execSync("bunx boronix inspect / --json", { cwd: appPath }).toString()
  const parsedInspect = JSON.parse(inspectJson)
  if (!parsedInspect.success) {
    console.error("✖ Inspect failed:", inspectJson)
    process.exit(1)
  }
  console.log("✔ Inspect / parsed successfully:", parsedInspect.matched)

  console.log("✔ smoke-pack test completed successfully!")
} finally {
  console.log("Cleaning up temp directory...")
  rmSync(tempDir, { recursive: true, force: true })
  // Clean local tarballs
  if (existsSync(boronixTar)) rmSync(boronixTar)
  if (existsSync(createTar)) rmSync(createTar)
}
