import { page, redirect } from "goros"

type DemoUser = {
  email: string
  name: string
}

export default page(async ({ auth }) => {
  const user = auth.user<DemoUser>()

  if (!user) {
    return redirect("/login")
  }

  return {
    title: "Dashboard",
    user
  }
})
