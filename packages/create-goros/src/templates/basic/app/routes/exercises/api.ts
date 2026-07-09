import { api, json } from "goros"

export const GET = api(async () => {
  return json({
    exercises: [
      { title: "Render HTML" },
      { title: "Handle actions" }
    ]
  })
})
