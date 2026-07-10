# 404 / Not Found Resolution

Boronix supports route-level and global custom 404 pages.

## File Convention
You can define custom 404 pages using HTML files:
- `app/not-found.html` (Global fallback)
- `app/routes/<route>/not-found.html` (Route-specific fallback)

## Resolution Order
1. If a route-specific `not-found.html` exists in the matched folder or its ancestors (within `app/routes`), it is used.
2. Otherwise, if the global `app/not-found.html` exists, it is rendered.
3. If neither is defined, Boronix renders a default visual 404 page (including suggestions for route candidates during development).

## API & Action Behavior
- **API Request**: Returns a clean JSON 404 response if the endpoint doesn't exist or `notFound()` is thrown.
- **Action Request**: Fails with 404 status and error code if the action target is not found.
- **notFound()**: You can throw or return `notFound()` inside page loaders, APIs, and actions to trigger this resolution.
