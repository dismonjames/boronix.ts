import { action, fail, redirect } from "goros"

export const login = action(async ({ form }) => {
  if (!form.string("email") || !form.string("password")) {
    return fail({ message: "Missing credentials" })
  }

  return redirect("/exercises")
})
