import { expect, test, beforeAll, afterAll } from "bun:test"
import fs from "node:fs"
import path from "node:path"
import { createBoronixApp } from "../packages/boronix/src/core/app"
import { defaultConfig } from "../packages/boronix/src/config/types"

const tmpProj = path.join(__dirname, "../tmp-request-id-test")

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
})

test("response contains x-boronix-request-id", async () => {
  const app = createBoronixApp({
    root: tmpProj,
    config: defaultConfig,
    dev: true
  })

  const req = new Request("http://localhost/")
  const res = await app.fetch(req)

  const requestId = res.headers.get("x-boronix-request-id")
  expect(requestId).toBeDefined()
  expect(requestId).toMatch(/^req_/)
})
