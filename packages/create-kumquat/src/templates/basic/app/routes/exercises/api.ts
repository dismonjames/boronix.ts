import { api, json } from "kumquat"

export const GET = api(async () => {
  return json({
    exercises: [
      { title: "Render HTML" },
      { title: "Handle actions" }
    ]
  })
})
