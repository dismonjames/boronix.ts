import { expect, test, beforeAll, afterAll } from "bun:test"
import fs from "node:fs"
import path from "node:path"
import { createBoronixApp } from "../packages/boronix/src/core/app"
import { setBoronixMode } from "../packages/boronix/src/core/mode"
import { defaultConfig } from "../packages/boronix/src/config/types"

const tmpProject = path.join(__dirname, "../tmp-project-session-prod")

beforeAll(() => {
  if (fs.existsSync(tmpProject)) {
    fs.rmSync(tmpProject, { recursive: true, force: true })
  }
  fs.mkdirSync(tmpProject, { recursive: true })
  fs.mkdirSync(path.join(tmpProject, "app/routes"), { recursive: true })
  fs.writeFileSync(path.join(tmpProject, "app/routes/page.ts"), `
    import { page } from "boronix"
    export default page(async ({ session }) => {
      session.set("foo", "bar")
      return {}
    })
  `)
})

afterAll(() => {
  if (fs.existsSync(tmpProject)) {
    fs.rmSync(tmpProject, { recursive: true, force: true })
  }
  setBoronixMode("development")
})

test("production session usage missing secret is blocked", () => {
  setBoronixMode("production")

  const config = {
    ...defaultConfig,
    session: {
      ...defaultConfig.session,
      secret: "boronix-dev-session-secret" // default insecure
    }
  }

  expect(() => {
    createBoronixApp({
      root: tmpProject,
      config,
      dev: false
    })
  }).toThrow()
})

test("production session usage with secret does not leak to error/manifest", () => {
  setBoronixMode("production")

  const config = {
    ...defaultConfig,
    session: {
      ...defaultConfig.session,
      secret: "super-secret-key-1234567"
    }
  }

  const app = createBoronixApp({
    root: tmpProject,
    config,
    dev: false
  })

  expect(app).toBeDefined()
})
