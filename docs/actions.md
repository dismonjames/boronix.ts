# Actions

Actions handle POST forms local to the current route.

```html
<form method="post" action="?/login">
  <input name="email">
  <button>Login</button>
</form>
```

```ts
import { action, fail, redirect } from "boronix"

export const login = action(async ({ form }) => {
  if (!form.string("email")) return fail({ message: "Missing email" })
  return redirect("/exercises")
})
```
