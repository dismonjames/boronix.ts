import { page } from "boronix"
import { exercises } from "../../server/exercises"

export default page(async () => {
  return {
    title: "Exercises",
    exercises
  }
})
