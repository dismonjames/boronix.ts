# Session Hardening in Boronix

Boronix implements cryptographic cookie sessions. In version 0.5.0, session secret handling is hardened for production safety.

## Configuration

Set `session.secret` in `boronix.config.ts`:

```ts
export default defineConfig({
  session: {
    secret: process.env.BORONIX_SESSION_SECRET
  }
})
```

Or provide `BORONIX_SESSION_SECRET` directly in the environment:

```bash
BORONIX_SESSION_SECRET="your-highly-secure-random-secret" bun run start
```

## Development Behavior

- If the secret is missing in `boronix dev`, a warning is logged **exactly once** per process.
- Fallback development secret is allowed in dev mode.

## Production Behavior

- In `production` mode, if session or auth usage is detected (meaning code contains `session` or `auth` keywords), a real session secret is strictly required.
- Refusing to provide a secret triggers `KQ_SESSION_SECRET_MISSING` at start/build/doctor time.
- Secrets are never leaked to logs, manifest, terminal, or error diagnostics.
