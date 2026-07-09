import { expect, test } from "bun:test"
import { readFileSync, existsSync } from "node:fs"
import path from "node:path"

test("goros package metadata", () => {
  const pkgPath = path.resolve("packages/goros/package.json")
  expect(existsSync(pkgPath)).toBe(true)

  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"))
  expect(pkg.name).toBe("goros")
  expect(pkg.version).toBe("0.2.5")
  expect(pkg.license).toBe("MPL-2.0")
  expect(pkg.bin.goros).toBe("dist/cli/main.js")
  expect(pkg.exports["."].import).toBe("./dist/index.js")
  expect(pkg.exports["."].types).toBe("./dist/index.d.ts")
  expect(pkg.files).toContain("dist")
  expect(pkg.files).toContain("README.md")
  expect(pkg.files).toContain("LICENSE")
})

test("create-goros package metadata", () => {
  const pkgPath = path.resolve("packages/create-goros/package.json")
  expect(existsSync(pkgPath)).toBe(true)

  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"))
  expect(pkg.name).toBe("create-goros")
  expect(pkg.version).toBe("0.2.5")
  expect(pkg.license).toBe("MPL-2.0")
  expect(pkg.bin["create-goros"]).toBe("dist/index.js")
  expect(pkg.files).toContain("dist")
  expect(pkg.files).toContain("src/templates")
  expect(pkg.files).toContain("README.md")
  expect(pkg.files).toContain("LICENSE")
})
