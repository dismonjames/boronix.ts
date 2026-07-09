import { page } from "goros"
import { exercises } from "../../server/exercises"

export default page(async () => {
  return {
    title: "Exercises",
    exercises
  }
})
