# Boronix Doctor

Verify your project health and production readiness using the doctor utility.

## Command Usage

```bash
# General health checks
boronix doctor

# Production environment checks
boronix doctor --production

# Machine-readable output mode
boronix doctor --production --json
```

## Production Verification Checks

When running in `--production` mode, the doctor validates:
- **Build Manifest**: Checks that `.boronix/manifest.json` exists and is version 1.
- **Build Runtime**: Checks if the target runtime (Bun/Node) matches start runtime.
- **Output Files**: Confirms the build output folder exists.
- **Host and Port**: Checks server port is integer (1-65535) and host is non-empty.
- **Session Configuration**: Verifies session.secret is customized if sessions are in use.
- **Public Directory**: Ensures public dir doesn't escape project root.
- **Database (Optional)**: If Drizzle is used, runs schema, client, and config checks.

## Exit Codes

- `0` - Project is healthy / production-ready.
- `1` - Blocker issues found.
