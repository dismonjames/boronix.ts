import { expect, test } from "bun:test"
import { formatRoutesSummary, type CliRouteEntry } from "../packages/goros/src/cli/ui/table"
import { initUiSettings, areColorsEnabled } from "../packages/goros/src/cli/ui/terminal"

const mockRoutes: CliRouteEntry[] = [
  { symbol: "page", method: "GET", path: "/login", type: "page", source: "app/routes/login/page.html" }
]

test("wide mode contains source path", () => {
  const originalColumns = process.stdout.columns
  Object.defineProperty(process.stdout, "columns", { value: 120, configurable: true })
  
  initUiSettings({ plain: false })
  const output = formatRoutesSummary(mockRoutes, false)
  expect(output).toContain("app/routes/login/page.html")
  
  Object.defineProperty(process.stdout, "columns", { value: originalColumns, configurable: true })
})

test("compact mode hides source path", () => {
  const originalColumns = process.stdout.columns
  Object.defineProperty(process.stdout, "columns", { value: 80, configurable: true })
  
  initUiSettings({ plain: false })
  const output = formatRoutesSummary(mockRoutes, false)
  expect(output).not.toContain("app/routes/login/page.html")
  expect(output).toContain("GET")
  
  Object.defineProperty(process.stdout, "columns", { value: originalColumns, configurable: true })
})

test("narrow mode uses multiline route list", () => {
  const originalColumns = process.stdout.columns
  Object.defineProperty(process.stdout, "columns", { value: 40, configurable: true })
  
  initUiSettings({ plain: false })
  const output = formatRoutesSummary(mockRoutes, false)
  expect(output).toContain("GET page") // multiline logs: second line has GET page
  
  Object.defineProperty(process.stdout, "columns", { value: originalColumns, configurable: true })
})

test("plain mode has no ANSI escape", () => {
  initUiSettings({ plain: true })
  const output = formatRoutesSummary(mockRoutes, true)
  expect(output).not.toContain("\x1b[")
})

test("NO_COLOR disables colors", () => {
  const originalNoColor = process.env.NO_COLOR
  process.env.NO_COLOR = "1"
  
  initUiSettings()
  expect(areColorsEnabled()).toBe(false)
  
  if (originalNoColor === undefined) {
    delete process.env.NO_COLOR
  } else {
    process.env.NO_COLOR = originalNoColor
  }
})
