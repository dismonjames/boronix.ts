import { action, redirect } from "goros"

export const logout = action(async ({ auth, flash }) => {
  auth.logout()
  flash.set("success", "Logged out")
  return redirect("/login")
})
