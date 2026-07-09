import { action, fail } from "goros"

export const submit = action(async ({ form }) => {
  const answer = form.string("answer")

  if (!answer) {
    return fail({
      message: "Answer is required"
    })
  }

  return fail({
    message: "Demo action received your answer."
  }, { status: 200 })
})
