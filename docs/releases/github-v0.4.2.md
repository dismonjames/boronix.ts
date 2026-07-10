# Release v0.4.2 - SQLite Runtime Guard

## Highlights

- `create-boronix --db sqlite --runtime node` now fails fast with a clear error.
- SQLite docs now state that `--db sqlite` requires `--runtime bun` because the generated client uses `bun:sqlite`.
- Postgres docs now explicitly state that `--db postgres` works with Bun or Node.

## Notes

This patch protects users from scaffolding a SQLite app that cannot run under Node.
