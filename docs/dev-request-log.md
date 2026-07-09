# Dev Request Log

The dev request logging tracks every incoming request handled by the server (SSR, actions, APIs, misses, and server crashes) in real-time.

## Format

```txt
GET   /login                 ✔ 200  serve   5ms
POST  /login?/login          ⚠ 400  action  8ms   fail
POST  /login?/login          ➜ 303  action  11ms  /dashboard
GET   /dashboard             ✔ 200  render  7ms
GET   /api/exercises         ✔ 200  api     3ms
GET   /missing               ⚠ 404  miss    2ms
GET   /crash                 ✖ 500  error   18ms
```

### Kind Definitions

- `serve`: Static file or HTML page without page loader.
- `render`: Server rendered page containing a custom `page.ts` loader.
- `api`: API module request.
- `action`: Form action request.
- `miss`: 404 Not Found request.
- `error`: 500 Server error.

## Custom Filtering

- Static assets (such as `.css`, `.png`, `.js`) are omitted by default to avoid clutter.
- Use `--verbose` to output static asset requests.
- Use `--quiet` to only output startup headers and server error codes.
