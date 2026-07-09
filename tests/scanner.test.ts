import { mkdirSync, rmSync, writeFileSync } from "node:fs"
import os from "node:os"
import path from "node:path"
import { expect, test } from "bun:test"
import { scanRoutes } from "../packages/kumquat/src/scanner/scan-routes"

test("scans route capsules", () => {
  const root = path.join(os.tmpdir(), `kumquat-scanner-${Date.now()}`)
  const routes = path.join(root, "app", "routes")

  mkdirSync(path.join(routes, "home"), { recursive: true })
  mkdirSync(path.join(routes, "login"), { recursive: true })
  mkdirSync(path.join(routes, "exercises", "[id]"), { recursive: true })
  writeFileSync(path.join(routes, "home", "page.html"), "")
  writeFileSync(path.join(routes, "login", "page.html"), "")
  writeFileSync(path.join(routes, "exercises", "api.ts"), "")
  writeFileSync(path.join(routes, "exercises", "[id]", "page.html"), "")

  const manifest = scanRoutes(routes)
  rmSync(root, { recursive: true, force: true })

  expect(manifest.some((item) => item.kind === "page" && item.routePath === "/")).toBe(true)
  expect(manifest.some((item) => item.kind === "page" && item.routePath === "/login")).toBe(true)
  expect(manifest.some((item) => item.kind === "page" && item.routePath === "/exercises/:id" && item.params.includes("id"))).toBe(true)
  expect(manifest.some((item) => item.kind === "api" && item.apiPath === "/api/exercises")).toBe(true)
})
