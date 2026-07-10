import { expect, test } from "bun:test"
import { writeFileSync, rmSync, mkdirSync } from "node:fs"
import path from "node:path"
import { generateCodeFrame, parseStackTrace } from "../packages/boronix/src/core/errors"

test("code frame extracts correct lines and formats caret", () => {
  const tempDir = path.resolve(".tmp-code-frame-test")
  mkdirSync(tempDir, { recursive: true })
  const testFile = path.join(tempDir, "test-file.ts")

  const content = `import { page } from "boronix"
export default page(async () => {
  const user = undefined
  return { email: user.email }
})`

  writeFileSync(testFile, content, "utf8")

  try {
    const frame = generateCodeFrame(testFile, 4, 24)
    expect(frame).toContain("> 4 |   return { email: user.email }")
    expect(frame).toContain("    |                        ^")
  } finally {
    rmSync(tempDir, { recursive: true, force: true })
  }
})

test("stack trace cleaner filters internal files", () => {
  const stack = `Error: Test
    at page (app/routes/login/page.ts:8:21)
    at run (/node_modules/boronix/src/core/app.ts:150:20)`

  const parsed = parseStackTrace(stack, ".")
  expect(parsed.file).toBe("app/routes/login/page.ts")
  expect(parsed.line).toBe(8)
  expect(parsed.column).toBe(21)
})
