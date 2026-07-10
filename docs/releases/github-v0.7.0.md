# v0.7.0 - Node-first Runtime

- Made Node.js the primary and default Boronix runtime.
- Changed the Boronix and create-boronix CLIs to run through Node.js.
- Made npm the canonical package manager and repository workflow.
- Migrated tests, builds and release scripts away from Bun-specific tooling.
- Added Node-based TypeScript development through tsx.
- Added JavaScript production server builds that run without tsx or source TypeScript.
- Made the Node HTTP adapter the default production adapter.
- Kept Bun as an explicit optional runtime.
- Replaced the Bun-only SQLite template with Drizzle and libSQL.
- Added Node 18.20, 20.19, 22 and 24 CI coverage.
