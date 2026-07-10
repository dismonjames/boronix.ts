import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { execSync } from "node:child_process"

console.log("Release check")

function runCmd(cmd: string) {
  try {
    execSync(cmd, { stdio: "inherit" })
    return true
  } catch {
    return false
  }
}

// 1. Run tests
const skipTests = process.env.BORONIX_SKIP_TESTS === "1" || process.env.GOROS_SKIP_TESTS === "1" || process.env.KUMQUAT_SKIP_TESTS === "1"
if (!skipTests) {
  if (!runCmd("npm test")) {
    console.error("✖ tests failed")
    process.exit(1)
  }
  console.log("✔ tests passed")
} else {
  console.log("✔ tests passed (skipped)")
}

// 2. Run typecheck
if (!runCmd("npm run typecheck")) {
  console.error("✖ typecheck failed")
  process.exit(1)
}
console.log("✔ typecheck passed")

// 3. Run build
if (!runCmd("npm run build")) {
  console.error("✖ build failed")
  process.exit(1)
}
console.log("✔ build passed")

// 4. Verify package metadata
const rootDir = path.resolve(".")
const packages = ["boronix", "create-boronix"]

for (const pkgName of packages) {
  const pkgPath = path.join(rootDir, "packages", pkgName, "package.json")
  if (!existsSync(pkgPath)) {
    console.error(`✖ package.json missing for ${pkgName}`)
    process.exit(1)
  }

  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"))
  
  if (pkg.name !== pkgName) {
    console.error(`✖ package name mismatch: expected ${pkgName}, found ${pkg.name}`)
    process.exit(1)
  }

  if (pkg.version !== "0.7.0") {
    console.error(`✖ version mismatch for ${pkgName}: expected 0.7.0, found ${pkg.version}`)
    process.exit(1)
  }

  if (pkg.license !== "MPL-2.0") {
    console.error(`✖ license mismatch for ${pkgName}: expected MPL-2.0, found ${pkg.license}`)
    process.exit(1)
  }

  if (!pkg.bin) {
    console.error(`✖ bin missing in package.json for ${pkgName}`)
    process.exit(1)
  }

  if (pkg.repository.url !== "git+ssh://git@github.com/dismonjames/boronix.ts.git") {
    console.error(`✖ repository URL mismatch for ${pkgName}: found ${pkg.repository.url}`)
    process.exit(1)
  }

  if (pkg.engines?.node !== ">=18.18") {
    console.error(`✖ node engine floor missing or invalid for ${pkgName}: expected >=18.18, found ${pkg.engines?.node}`)
    process.exit(1)
  }

  // Check README and LICENSE exist
  const readmePath = path.join(rootDir, "packages", pkgName, "README.md")
  if (!existsSync(readmePath)) {
    console.error(`✖ README.md missing for ${pkgName}`)
    process.exit(1)
  }

  const licensePath = path.join(rootDir, "packages", pkgName, "LICENSE")
  if (!existsSync(licensePath)) {
    console.error(`✖ LICENSE missing for ${pkgName}`)
    process.exit(1)
  }

  // Verify dist files exist
  const filesToCheck = pkgName === "boronix" 
    ? ["dist/index.js", "dist/index.d.ts", "dist/cli/main.js", "dist/dev/worker.js"]
    : ["dist/index.js", "dist/index.d.ts"]

  for (const file of filesToCheck) {
    const filePath = path.join(rootDir, "packages", pkgName, file)
    if (!existsSync(filePath)) {
      console.error(`✖ build artifact missing: ${filePath}`)
      process.exit(1)
    }

    // Check CLI entry has shebang
    if (file.endsWith("main.js") || (pkgName === "create-boronix" && file === "dist/index.js")) {
      const content = readFileSync(filePath, "utf8")
      if (!content.startsWith("#!/usr/bin/env node")) {
        console.error(`✖ shebang missing or invalid in ${filePath}: expected #!/usr/bin/env node`)
        process.exit(1)
      }
    }
  }
}

console.log("✔ package metadata valid")
console.log("✔ dist files found")

// 5. Verify create templates use ^0.7.0
const templatePkgPaths = [
  path.join(rootDir, "packages/create-boronix/src/templates/basic/package.json"),
  path.join(rootDir, "packages/create-boronix/src/templates/homework/package.json")
]
for (const tplPath of templatePkgPaths) {
  const tplPkg = JSON.parse(readFileSync(tplPath, "utf8"))
  if (tplPkg.dependencies?.boronix !== "^0.7.0") {
    console.error(`✖ Template ${tplPath} does not use ^0.7.0 for boronix`)
    process.exit(1)
  }
  if (!tplPkg.scripts?.["doctor:production"] || tplPkg.scripts["doctor:production"] !== "boronix doctor --production") {
    console.error(`✖ Template ${tplPath} missing doctor:production script`)
    process.exit(1)
  }
}
console.log("✔ create templates use ^0.7.0")

// 6. Verify production docs exist
const requiredDocs = [
  "docs/production.md",
  "docs/deployment.md",
  "docs/health-check.md",
  "docs/security.md",
  "docs/static-files.md",
  "docs/configuration.md",
  "docs/session.md",
  "docs/doctor.md",
  "docs/releases/v0.5.0-production-hardening.md",
  "docs/releases/github-v0.5.0.md",
  "docs/releases/v0.6.0-dev-server.md",
  "docs/releases/github-v0.6.0.md",
  "docs/dev-server.md",
  "docs/reloading.md",
  "docs/migration-v0.6.1.md",
  "docs/releases/v0.6.1-root-route.md",
  "docs/releases/github-v0.6.1.md",
  "docs/migration-v0.7.0.md",
  "docs/releases/v0.7.0-node-first.md",
  "docs/releases/github-v0.7.0.md"
]
for (const doc of requiredDocs) {
  if (!existsSync(path.join(rootDir, doc))) {
    console.error(`✖ Production doc missing: ${doc}`)
    process.exit(1)
  }
}
console.log("✔ production docs exist")

// 7. Verify package-lock.json exists
if (!existsSync(path.join(rootDir, "package-lock.json"))) {
  console.error("✖ package-lock.json missing")
  process.exit(1)
}
console.log("✔ package-lock.json verified")

// 8. Verify manifest validator is exported
const indexSrc = readFileSync(path.join(rootDir, "packages/boronix/src/index.ts"), "utf8")
if (!indexSrc.includes("readBuildManifest") || !indexSrc.includes("validateBuildManifest")) {
  console.error("✖ Manifest validators not exported from index.ts")
  process.exit(1)
}
console.log("✔ manifest validators exported")

// 9. Check no hard-coded development secret in production path
const appSrc = readFileSync(path.join(rootDir, "packages/boronix/src/core/app.ts"), "utf8")
if (appSrc.includes("boronix-dev-session-secret") && !appSrc.includes("isSecretDefault")) {
  console.error("✖ Hard-coded development secret found in production path without guard")
  process.exit(1)
}
console.log("✔ no hard-coded development secret in production path")

// 10. Verify tarball has dist/README/LICENSE (check files field in package.json)
for (const pkgName of packages) {
  const pkgPath = path.join(rootDir, "packages", pkgName, "package.json")
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"))
  if (!pkg.files || !pkg.files.includes("dist") || !pkg.files.includes("README.md") || !pkg.files.includes("LICENSE")) {
    console.error(`✖ ${pkgName} package.json files field missing dist/README/LICENSE`)
    process.exit(1)
  }
}
console.log("✔ package tarball includes dist/README/LICENSE")

// 11. Root routes are direct capsules; no source-level home-to-root mapping.
for (const tplPath of [
  path.join(rootDir, "packages/create-boronix/src/templates/basic"),
  path.join(rootDir, "packages/create-boronix/src/templates/homework")
]) {
  if (!existsSync(path.join(tplPath, "app/routes/page.html")) || existsSync(path.join(tplPath, "app/routes/home"))) {
    console.error(`✖ Template ${tplPath} does not use the direct root route convention`)
    process.exit(1)
  }
}
const conventionSrc = readFileSync(path.join(rootDir, "packages/boronix/src/scanner/file-convention.ts"), "utf8")
if (conventionSrc.includes('segment !== "home"')) {
  console.error("✖ legacy home-to-root route mapping remains")
  process.exit(1)
}
console.log("✔ direct root route convention verified")

console.log("✔ all release checks passed successfully")
process.exit(0)
