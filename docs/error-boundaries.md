# Error Boundaries

Error boundaries capture unexpected crashes during loader execution and template rendering, allowing you to display a custom fallback HTML page.

## File Convention
- `app/error.html` (Global fallback)
- `app/routes/<route>/error.html` (Route-specific fallback)

## Resolution Order
1. The route-specific `error.html` closest to the crashing route folder is rendered.
2. If none is found, falls back to `app/error.html`.
3. If no custom error files exist, Boronix returns a default error page.

## Template Context
Your custom `error.html` receives the following variables:
- `{{ message }}`: The error message (e.g. "Cannot read properties of undefined").
- `{{ status }}`: The HTTP status code (typically 500).
- `{{ route }}`: The pathname requested.
- `{{ phase }}`: The phase of execution where the crash occurred.

*Note: In development mode, the variables `{{ stack }}` and `{{ file }}` are also available.*
