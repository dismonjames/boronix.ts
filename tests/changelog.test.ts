import { expect, test } from "bun:test"
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"

test("CHANGELOG.md exists and contains v0.2.4 entry", () => {
  const changelogPath = path.resolve("CHANGELOG.md")
  expect(existsSync(changelogPath)).toBe(true)

  const content = readFileSync(changelogPath, "utf8")
  expect(content).toContain("## v0.2.4")
})
