import { page } from "boronix"

const exercises = [
  { title: "Render HTML" },
  { title: "Handle actions" }
]

export default page(async () => {
  return {
    title: "Exercises",
    exercises
  }
})
