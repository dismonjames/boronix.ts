import { action, fail, redirect } from "kumquat"

export const login = action(async ({ form }) => {
  const email = form.string("email")
  const password = form.string("password")

  if (!email || !password) {
    return fail({
      message: "Sai tài khoản hoặc mật khẩu"
    })
  }

  return redirect("/exercises")
})
