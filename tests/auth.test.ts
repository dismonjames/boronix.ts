import { expect, test } from "bun:test"
import { createAuth, AuthRequiredError } from "../packages/kumquat/src/core/auth"
import { createSession } from "../packages/kumquat/src/core/session"
import { defaultConfig } from "../packages/kumquat/src/config/types"

const sessionConfig = {
  ...defaultConfig.session,
  secret: "test-secret"
}

test("auth user returns null when absent", () => {
  const auth = createAuth(createSession(new Request("http://local/"), sessionConfig))

  expect(auth.user()).toBeNull()
})

test("login stores user", () => {
  const auth = createAuth(createSession(new Request("http://local/"), sessionConfig))

  auth.login({ email: "demo@example.com" })

  expect(auth.user<Record<string, string>>()).toEqual({ email: "demo@example.com" })
})

test("logout clears user", () => {
  const auth = createAuth(createSession(new Request("http://local/"), sessionConfig))

  auth.login({ email: "demo@example.com" })
  auth.logout()

  expect(auth.user()).toBeNull()
})

test("requireUser throws when absent", () => {
  const auth = createAuth(createSession(new Request("http://local/"), sessionConfig))

  expect(() => auth.requireUser()).toThrow(AuthRequiredError)
})
