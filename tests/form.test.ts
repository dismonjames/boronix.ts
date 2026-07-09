import { expect, test } from "bun:test"
import { createActionForm } from "../packages/boronix/src/route/action"

test("required validates missing values", () => {
  const form = createForm({})

  expect(form.required("email", "Email is required")).toBe("")
  expect(form.errors()).toEqual({ email: "Email is required" })
  expect(form.isValid()).toBe(false)
})

test("email validates basic format", () => {
  const form = createForm({ email: "not-email" })

  expect(form.email("email", "Invalid email")).toBe("not-email")
  expect(form.errors()).toEqual({ email: "Invalid email" })
})

test("min validates string length", () => {
  const form = createForm({ password: "123" })

  expect(form.min("password", 6, "Password too short")).toBe("123")
  expect(form.errors()).toEqual({ password: "Password too short" })
})

test("number parses numeric values", () => {
  const valid = createForm({ age: "42" })
  const invalid = createForm({ age: "old" })

  expect(valid.number("age", "Age must be a number")).toBe(42)
  expect(valid.isValid()).toBe(true)
  expect(invalid.number("age", "Age must be a number")).toBeNull()
  expect(invalid.errors()).toEqual({ age: "Age must be a number" })
})

test("boolean reads checkbox-like values", () => {
  expect(createForm({ remember: "on" }).boolean("remember")).toBe(true)
  expect(createForm({}).boolean("remember")).toBe(false)
})

test("values returns raw string values", () => {
  const form = createForm({ email: "demo@example.com", password: "secret" })

  expect(form.values()).toEqual({
    email: "demo@example.com",
    password: "secret"
  })
})

function createForm(values: Record<string, string>) {
  const formData = new FormData()
  for (const [name, value] of Object.entries(values)) {
    formData.set(name, value)
  }
  return createActionForm(formData)
}
