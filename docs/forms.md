# Forms & Actions

Actions handle POST requests submitted from HTML forms.

## Usage
Inside `page.html`:
```html
<form method="post" action="?/login">
  <input name="email" type="email" />
  <button type="submit">Login</button>
</form>
```

Inside `actions.ts`:
```ts
import { action, fail, redirect } from "boronix"

export const login = action(async ({ form }) => {
  const email = form.required("email", "Email is required")
  form.email("email", "Invalid email")

  if (!form.isValid()) {
    return fail({
      fields: form.errors(),
      values: form.values()
    })
  }

  return redirect("/")
})
```

## Form Helpers
The decorated `form` object provides:
- `string(name)`: Read string.
- `required(name, message)`: Validate presence.
- `email(name, message)`: Validate email format.
- `min(name, length, message)`: Validate min character length.
- `number(name, message)`: Parse number.
- `boolean(name)`: Parse checkbox state.
- `values()`: Retrieve all inputs.
- `errors()`: Retrieve validation errors.
- `isValid()`: Returns true if no validation errors occurred.

## Action Error Diagnostics
Boronix performs strict checks during development to save debug time:
- **HTTP Method**: Actions must be requested via `POST`. Requesting via other methods yields `KQ_INVALID_ACTION_METHOD`.
- **Missing Action Name**: An empty or missing query string like `?` yields `KQ_ACTION_NOT_FOUND`.
- **Missing Named Export**: If the requested action name is not exported in `actions.ts`, yields `KQ_ACTION_NOT_FOUND`.
- **Helper Wrapping**: All actions must be wrapped in the `action()` helper, otherwise yields `KQ_ACTION_NOT_WRAPPED`.
- **Return Types**: Handlers must return a `Response` (e.g. `redirect()`) or `fail()` helper result. Returns of other types yield `KQ_ACTION_INVALID_RETURN`.
