import { expect, test } from "bun:test"
import { createActionForm } from "../packages/boronix/src/route/action"
import { notFound } from "../packages/boronix/src/core/response"

test("createActionForm handles typical validations", () => {
  const data = new FormData()
  data.set("email", "invalid-email")
  data.set("required_field", "")

  const form = createActionForm(data)
  
  form.required("required_field", "required field missing")
  form.email("email", "invalid email address")

  expect(form.isValid()).toBe(false)
  expect(form.errors().required_field).toBe("required field missing")
  expect(form.errors().email).toBe("invalid email address")
})

test("notFound response returns 404", () => {
  const res = notFound()
  expect(res.status).toBe(404)
})
