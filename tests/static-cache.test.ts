import { expect, test, beforeAll, afterAll } from "bun:test"
import fs from "node:fs"
import path from "node:path"
import { servePublic } from "../packages/boronix/src/static/serve-public"
import { setBoronixMode } from "../packages/boronix/src/core/mode"

const tmpStaticDir = path.join(__dirname, "../tmp-static-cache-test")

beforeAll(() => {
  if (fs.existsSync(tmpStaticDir)) {
    fs.rmSync(tmpStaticDir, { recursive: true, force: true })
  }
  fs.mkdirSync(tmpStaticDir, { recursive: true })
  fs.writeFileSync(path.join(tmpStaticDir, "style.css"), "body {}", "utf8")
  fs.writeFileSync(path.join(tmpStaticDir, "app.12345678.js"), "console.log(1)", "utf8")
})

afterAll(() => {
  if (fs.existsSync(tmpStaticDir)) {
    fs.rmSync(tmpStaticDir, { recursive: true, force: true })
  }
  setBoronixMode("development")
})

test("static dev uses no-store Cache-Control", async () => {
  setBoronixMode("development")
  const url = new URL("http://localhost/style.css")
  const res = await servePublic(tmpStaticDir, url)
  expect(res).toBeDefined()
  expect(res!.headers.get("cache-control")).toBe("no-store")
})

test("static production regular file uses public max-age=3600", async () => {
  setBoronixMode("production")
  const url = new URL("http://localhost/style.css")
  const res = await servePublic(tmpStaticDir, url)
  expect(res).toBeDefined()
  expect(res!.headers.get("cache-control")).toBe("public, max-age=3600")
})

test("static production hashed file uses public max-age=31536000, immutable", async () => {
  setBoronixMode("production")
  const url = new URL("http://localhost/app.12345678.js")
  const res = await servePublic(tmpStaticDir, url)
  expect(res).toBeDefined()
  expect(res!.headers.get("cache-control")).toBe("public, max-age=31536000, immutable")
})
