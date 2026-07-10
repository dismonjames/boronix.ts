# Release v0.3.0 - Developer Experience Core

This release equips Boronix with state-of-the-art developer diagnostics, detailed error reporting, and type generation.

## Key Changes:
- **Dev Error Page**: Premium dark-theme browser error pages complete with code framing, caret pointing, and cleaned stack traces.
- **Error/Not-Found Boundaries**: Convention-based `app/error.html` and `app/not-found.html` with cascading resolution.
- **CLI inspect diagnostics**: Upgraded `inspect` command supporting POST action URL parsing, `--method`, and `--json`.
- **Form/Action DX**: Catching missing actions, wrong methods, incorrect exports, and type issues.
- **Typegen**: Type generation for page/API/action routes and parameters under `.boronix/types/routes.d.ts`.
