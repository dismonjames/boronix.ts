import { api, json } from "goros"
import { exercises } from "../../server/exercises"

export const GET = api(async () => {
  return json({ exercises })
})
