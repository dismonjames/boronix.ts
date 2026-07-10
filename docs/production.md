# Production Mode in Boronix

Boronix distinguishes between `development` and `production` environments to ensure safety, performance, and clear debugging.

## Determining Environment Mode

Boronix determines the mode based on the following priority:
1. **CLI Command**:
   - `boronix dev` sets mode to `development`
   - `boronix build` runs in `production` validation context
   - `boronix start` runs in `production`
2. **`BORONIX_ENV`** environment variable (can be `development` or `production`)
3. **`NODE_ENV`** environment variable fallback

## Production Hardening Features

- **Strict Build Manifest**: Running `boronix start` requires a valid manifest generated via `boronix build`.
- **Runtime Validation**: Refuses to start if the manifest was built for Bun but started with Node (or vice-versa).
- **Graceful Shutdown**: Server captures SIGINT/SIGTERM, stops accepting requests, drains existing connections (up to 5s), and exits.
- **Request IDs**: Generates tracing IDs (`requestId` / `x-boronix-request-id`) for request/response logs.
- **Safe Error Responses**: Clean 500 pages and structured JSON errors without leaks (stack traces, filesystem paths, credentials, secrets).
