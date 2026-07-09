# Pages

`page.html` is the rendered HTML template.

`page.ts` is optional and exports a default `page()` handler that returns template data or a `Response`.

```ts
import { page } from "goros"

export default page(async () => {
  return { title: "Hello" }
})
```
