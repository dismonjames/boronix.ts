import { expect, test } from "bun:test"
import { readFileSync, existsSync } from "node:fs"
import path from "node:path"

test("package names and CLI commands are rebranded", () => {
  const gorosPkg = JSON.parse(readFileSync("packages/goros/package.json", "utf8"))
  expect(gorosPkg.name).toBe("goros")
  expect(gorosPkg.bin.goros).toBe("dist/cli/main.js")

  const createPkg = JSON.parse(readFileSync("packages/create-goros/package.json", "utf8"))
  expect(createPkg.name).toBe("create-goros")
  expect(createPkg.bin["create-goros"]).toBe("dist/index.js")
})

test("templates config and package scripts reference goros", () => {
  const basicPkg = JSON.parse(readFileSync("packages/create-goros/src/templates/basic/package.json", "utf8"))
  expect(basicPkg.scripts.dev).toBe("goros dev")
  expect(basicPkg.scripts.build).toBe("goros build")
  expect(basicPkg.scripts.start).toBe("goros start")
  expect(basicPkg.dependencies.goros).toBe("^0.2.5")

  const basicConfig = path.resolve("packages/create-goros/src/templates/basic/goros.config.ts")
  expect(existsSync(basicConfig)).toBe(true)
})

test("docs, changelog and release notes updated", () => {
  const changelog = readFileSync("CHANGELOG.md", "utf8")
  expect(changelog).toContain("## v0.2.5 - Rebrand to Goros")

  const readme = readFileSync("README.md", "utf8")
  expect(readme).toContain("# Goros")
  expect(readme).not.toContain("# Kumquat.ts")
})
