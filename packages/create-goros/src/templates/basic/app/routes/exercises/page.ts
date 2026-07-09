import { page } from "goros"

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
