import { existsSync, mkdirSync, rmSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { execSync } from "node:child_process"
import os from "node:os"

console.log("Running smoke pack test...")

const rootDir = path.resolve(".")
const gorosTar = path.join(rootDir, "packages/goros/goros-0.2.5.tgz")
const createTar = path.join(rootDir, "packages/create-goros/create-goros-0.2.5.tgz")

// Clean old tarballs if exist
if (existsSync(gorosTar)) rmSync(gorosTar)
if (existsSync(createTar)) rmSync(createTar)

// Pack packages
console.log("Packing packages...")
execSync("cd packages/goros && bun pm pack", { stdio: "inherit" })
execSync("cd packages/create-goros && bun pm pack", { stdio: "inherit" })

if (!existsSync(gorosTar) || !existsSync(createTar)) {
  console.error("✖ Packing failed")
  process.exit(1)
}

const tempDir = path.join(os.tmpdir(), `goros-smoke-${Date.now()}`)
mkdirSync(tempDir, { recursive: true })

try {
  // Test create-goros non-interactive scaffolding using the built script
  console.log("Testing create-goros non-interactive...")
  execSync(`bun ${rootDir}/packages/create-goros/dist/index.js my-app --template basic --runtime bun --no-install --no-git`, {
    cwd: tempDir,
    stdio: "inherit"
  })

  const appPath = path.join(tempDir, "my-app")
  const scaffoldedPkgPath = path.join(appPath, "package.json")
  if (!existsSync(scaffoldedPkgPath)) {
    console.error("✖ Scaffolding package.json missing")
    process.exit(1)
  }
  if (!existsSync(path.join(appPath, "goros.config.ts"))) {
    console.error("✖ Scaffolding goros.config.ts missing")
    process.exit(1)
  }

  // Pre-clean template placeholder dependency to avoid registry resolve errors before local install
  const pkg = JSON.parse(readFileSync(scaffoldedPkgPath, "utf8"))
  if (pkg.dependencies && pkg.dependencies.goros) {
    delete pkg.dependencies.goros
  }
  writeFileSync(scaffoldedPkgPath, JSON.stringify(pkg, null, 2), "utf8")

  // Update dependencies in the scaffolded app to point to the local goros tarball
  console.log("Installing local goros tarball in scaffolded app...")
  execSync(`bun add ${gorosTar}`, { cwd: appPath, stdio: "inherit" })

  // Run doctor
  console.log("Running bunx goros doctor...")
  execSync("bunx goros doctor", { cwd: appPath, stdio: "inherit" })

  // Run build
  console.log("Running bunx goros build...")
  execSync("bunx goros build", { cwd: appPath, stdio: "inherit" })

  // Verify .goros/manifest.json exists
  const manifestFile = path.join(appPath, ".goros", "manifest.json")
  if (!existsSync(manifestFile)) {
    console.error("✖ Production manifest .goros/manifest.json missing after build")
    process.exit(1)
  }

  // Run routes --json
  console.log("Running bunx goros routes --json...")
  const routesJson = execSync("bunx goros routes --json", { cwd: appPath }).toString()
  const parsed = JSON.parse(routesJson)
  if (!Array.isArray(parsed) || parsed.length === 0) {
    console.error("✖ Invalid routes JSON output:", routesJson)
    process.exit(1)
  }
  console.log("✔ Routes parsed successfully:", parsed.length, "routes found")

  console.log("✔ smoke-pack test completed successfully!")
} finally {
  console.log("Cleaning up temp directory...")
  rmSync(tempDir, { recursive: true, force: true })
  // Clean local tarballs
  if (existsSync(gorosTar)) rmSync(gorosTar)
  if (existsSync(createTar)) rmSync(createTar)
}
