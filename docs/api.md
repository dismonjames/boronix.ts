# API

`api.ts` creates a JSON API route under `/api`.

```ts
import { api, json } from "boronix"

export const GET = api(async () => {
  return json({ ok: true })
})
```
