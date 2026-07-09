# Decisions

- v0.1 targets Bun first. Node and Deno runtime files exist only as placeholders.
- The build command writes a route manifest and metadata instead of bundling the user app.
- Layout rendering uses `{{ body }}` as a reserved raw slot inside `app/layout.html`.
- Missing template keys render as an empty string.
- Route modules are imported directly from TypeScript source in Bun during v0.1.
