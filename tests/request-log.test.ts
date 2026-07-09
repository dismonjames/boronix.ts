import { expect, test } from "bun:test"
import { isStaticAsset, logRequest } from "../packages/goros/src/cli/ui/activity"

test("isStaticAsset detects static file extensions", () => {
  expect(isStaticAsset("/style.css")).toBe(true)
  expect(isStaticAsset("/images/logo.png")).toBe(true)
  expect(isStaticAsset("/favicon.ico")).toBe(true)
  expect(isStaticAsset("/exercises")).toBe(false)
  expect(isStaticAsset("/")).toBe(false)
})

test("logRequest formats and runs without crashing", () => {
  // Simple check to ensure formatting functions execute successfully
  logRequest("GET", "/", 200, "render", 10)
  logRequest("POST", "/login?/login", 303, "action", 12, "/dashboard")
  logRequest("GET", "/missing", 404, "miss", 2)
  logRequest("GET", "/crash", 500, "error", 15)
  expect(true).toBe(true)
})
