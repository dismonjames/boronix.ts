import { expect, test } from "bun:test"
import { createFlash } from "../packages/goros/src/core/flash"
import { createSession } from "../packages/goros/src/core/session"
import { defaultConfig } from "../packages/goros/src/config/types"

const sessionConfig = {
  ...defaultConfig.session,
  secret: "test-secret"
}

test("sets flash messages", () => {
  const flash = createFlash(createSession(new Request("http://local/"), sessionConfig))

  flash.set("success", "Saved")

  expect(flash.get()).toEqual([{ type: "success", message: "Saved" }])
})

test("consumes flash once", () => {
  const flash = createFlash(createSession(new Request("http://local/"), sessionConfig))

  flash.set("success", "Saved")

  expect(flash.consume()).toEqual([{ type: "success", message: "Saved" }])
  expect(flash.consume()).toEqual([])
})

test("flash survives redirect-like session flow", () => {
  const session = createSession(new Request("http://local/"), sessionConfig)
  const flash = createFlash(session)

  flash.set("success", "Logged out")

  const cookie = session.commit()
  const nextSession = createSession(new Request("http://local/login", {
    headers: {
      cookie
    }
  }), sessionConfig)
  const nextFlash = createFlash(nextSession)

  expect(nextFlash.consume("success")).toEqual([{ type: "success", message: "Logged out" }])
})
