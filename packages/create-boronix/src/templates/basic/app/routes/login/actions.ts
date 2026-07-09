import { action, fail, redirect } from "boronix"

export const login = action(async ({ form }) => {
  if (!form.string("email") || !form.string("password")) {
    return fail({ message: "Missing credentials" })
  }

  return redirect("/exercises")
})
