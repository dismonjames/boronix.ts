import { expect, test, beforeAll, afterAll } from "bun:test"
import fs from "node:fs"
import path from "node:path"
import { createBoronixApp } from "../packages/boronix/src/core/app"
import { setBoronixMode } from "../packages/boronix/src/core/mode"
import { defaultConfig } from "../packages/boronix/src/config/types"

const tmpProj = path.join(__dirname, "../tmp-security-headers-test")

beforeAll(() => {
  if (fs.existsSync(tmpProj)) {
    fs.rmSync(tmpProj, { recursive: true, force: true })
  }
  fs.mkdirSync(tmpProj, { recursive: true })
  fs.mkdirSync(path.join(tmpProj, "app/routes"), { recursive: true })
  fs.writeFileSync(path.join(tmpProj, "app/routes/page.html"), "<h1>Home</h1>", "utf8")
})

afterAll(() => {
  if (fs.existsSync(tmpProj)) {
    fs.rmSync(tmpProj, { recursive: true, force: true })
  }
  setBoronixMode("development")
})

test("security headers are added in production mode", async () => {
  setBoronixMode("production")

  const app = createBoronixApp({
    root: tmpProj,
    config: {
      ...defaultConfig,
      security: {
        headers: true
      }
    },
    dev: false
  })

  const req = new Request("http://localhost/")
  const res = await app.fetch(req)

  expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff")
  expect(res.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin")
  expect(res.headers.get("X-Frame-Options")).toBe("SAMEORIGIN")
})
