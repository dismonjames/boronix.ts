import { api, json } from "boronix"
import { exercises } from "../../server/exercises"

export const GET = api(async () => {
  return json({ exercises })
})
